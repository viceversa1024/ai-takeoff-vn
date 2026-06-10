// Ambiguous evidence generation. Detected hidden actions surface as "trace"
// reports next turn; an independent noise generator produces benign reports
// with overlapping surface text. The player can never tell from text alone.

import type { EvidenceItem, GameState, HiddenAIAction, RollRecord } from './types';
import type { Rng } from './rng';
import { evidenceTemplates } from '../content/evidenceTemplates';

const MAX_EVIDENCE_PER_TURN = 2;

export function generateEvidence(
  state: GameState,
  action: HiddenAIAction | null,
  rngNoise: Rng,
  rolls: RollRecord[],
): EvidenceItem[] {
  const out: EvidenceItem[] = [];

  // High situational awareness can turn a real signal into reassurance: the
  // model knew the eval shape and shaped its trace to read clean (Cotra).
  const saMasks = state.hidden.sitAwareness >= 60;

  if (action && action.detected && saMasks && isHostile(action) && rngNoise() < 0.5) {
    const clean = evidenceTemplates.find((t) => t.id === 'falseclean_eval');
    if (clean) out.push({ templateId: clean.id, source: 'false-clean', block: clean.block });
  } else if (action && action.detected) {
    const trace = evidenceTemplates.find((t) => t.source === 'trace' && t.forAction === action.type);
    if (trace) out.push({ templateId: trace.id, source: 'trace', block: trace.block });
  } else if (action && action.succeeded && isHostile(action) && !action.detected) {
    // Undetected real action: small chance of an indirect anomaly — a weak trace.
    const pWeak = 0.15;
    const r = rngNoise();
    rolls.push({ label: '[hidden] indirect anomaly surfaces', p: pWeak, roll: r, success: r < pWeak });
    if (r < pWeak) {
      const trace = evidenceTemplates.find((t) => t.source === 'trace' && t.forAction === action.type);
      if (trace) out.push({ templateId: trace.id, source: 'weak-trace', block: trace.block });
    }
  }

  // Independent false-positive channel: more evals => more flags, true or not.
  const pNoise = 0.1 + 0.2 * (state.alloc.evals / 100);
  const r = rngNoise();
  rolls.push({ label: 'eval noise (false positive)', p: pNoise, roll: r, success: r < pNoise });
  if (r < pNoise) {
    const noisePool = evidenceTemplates.filter((t) => t.source === 'noise');
    const pick = noisePool[Math.floor(rngNoise() * noisePool.length)];
    if (pick && !out.some((e) => e.templateId === pick.id)) {
      out.push({ templateId: pick.id, source: 'noise', block: pick.block });
    }
  }

  return out.slice(0, MAX_EVIDENCE_PER_TURN);
}

function isHostile(action: HiddenAIAction): boolean {
  return !['none', 'helpful', 'inflate'].includes(action.type);
}
