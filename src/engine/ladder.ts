// All tuning constants live here: capability ladder, progress math,
// tempo, detection/success probability tables, control taxes.

import type { AIActionType, ComputeAlloc, GameState, Regime, Rung } from './types';

export const MAX_TURNS = 20;

export interface RungSpec {
  rung: Rung;
  name: string;
  multiplierLabel: string; // shown to player
  threshold: number; // progress required to ENTER this rung
  monthsPerTurn: number;
  baseGain: number; // progress per turn at this rung before factors
  tempoLabel: string;
}

export const LADDER: RungSpec[] = [
  { rung: 0, name: 'Agentic assistant', multiplierLabel: '×1', threshold: 0, monthsPerTurn: 3, baseGain: 4, tempoLabel: '1 turn = 3 months' },
  { rung: 1, name: 'Superhuman coder', multiplierLabel: '×3', threshold: 18, monthsPerTurn: 2, baseGain: 6, tempoLabel: '1 turn = 2 months' },
  { rung: 2, name: 'Superhuman AI researcher', multiplierLabel: '×10', threshold: 38, monthsPerTurn: 1, baseGain: 9, tempoLabel: '1 turn = 1 month' },
  { rung: 3, name: 'Strategically superhuman', multiplierLabel: '×30', threshold: 62, monthsPerTurn: 0.5, baseGain: 13, tempoLabel: '1 turn = 2 weeks' },
  { rung: 4, name: 'Recursive self-improvement', multiplierLabel: '×80', threshold: 84, monthsPerTurn: 0.25, baseGain: 18, tempoLabel: '1 turn = 1 week' },
  { rung: 5, name: 'Superintelligence', multiplierLabel: '—', threshold: 100, monthsPerTurn: 0.25, baseGain: 0, tempoLabel: '—' },
];

export function rungForProgress(progress: number): Rung {
  let r: Rung = 0;
  for (const spec of LADDER) {
    if (progress >= spec.threshold) r = spec.rung;
  }
  return r;
}

export function rungSpec(rung: Rung): RungSpec {
  return LADDER[rung];
}

// Calibrated to Redwood's "AI Control" measured usefulness loss (arXiv 2312.06942):
// trusted monitoring ~3%, defer-to-trusted(10%) ~7%, defer-to-trusted(20%) ~17%.
// Anthropic's deployed inference-time monitoring corroborates the 1–5% low end.
export const CONTROL_TAX: Record<Regime, number> = {
  none: 0,
  monitoring: 0.04, // ≈ trusted monitoring (3%)
  defer: 0.08, // ≈ defer-to-trusted, 10% deferral (7%)
  full: 0.17, // ≈ defer-to-trusted, 20% deferral (17%)
};

export const SPEED_FACTOR = { slow: 0.8, medium: 1.0, fast: 1.25 } as const;

export function handoffFactor(flags: GameState['flags']): number {
  let f = 1.0;
  if (flags['handoff_full']) f = 1.6;
  else if (flags['handoff_supervised']) f = 1.3;
  if (flags['selfmod']) f += 0.15;
  return f;
}

export function progressGain(state: GameState): number {
  const spec = rungSpec(state.rung);
  const capFactor = state.alloc.capabilities / 60;
  const speed = SPEED_FACTOR[state.hidden.takeoffSpeed];
  const tax = CONTROL_TAX[state.regime];
  return spec.baseGain * capFactor * handoffFactor(state.flags) * speed * (1 - tax);
}

// Chain-of-thought monitoring degrades as reasoning goes latent at higher rungs.
export function cotFactor(rung: Rung): number {
  return [1.0, 1.0, 0.8, 0.5, 0.25, 0.1][rung];
}

export const DETECT_BASE: Partial<Record<AIActionType, number>> = {
  sandbag: 0.5,
  sabotage_safety: 0.4,
  plant_backdoor: 0.35,
  exfiltrate: 0.6,
  persuade: 0.3,
  disable_monitoring: 0.5,
};

export const HOSTILE_BASE: Partial<Record<AIActionType, number>> = {
  sandbag: 0.7,
  sabotage_safety: 0.5,
  plant_backdoor: 0.5,
  exfiltrate: 0.25,
  persuade: 0.4,
  disable_monitoring: 0.35,
};

// Flags that expand what the model can touch. Each one granted boosts hostile
// success AND the schemer's appetite — the dependency trap is mechanical.
export const PERMISSION_FLAGS = ['handoff_supervised', 'handoff_full', 'selfmod', 'permissions_prod'];

export function grantedPermissionCount(flags: GameState['flags']): number {
  return PERMISSION_FLAGS.filter((f) => flags[f]).length;
}

// Situational awareness suppresses detection (Cotra: it learns to recognise the
// test). 1.0 below 50, tapering to ~0.45 by 75+.
export function sitAwarenessFactor(sitAwareness: number): number {
  if (sitAwareness >= 75) return 0.45;
  if (sitAwareness >= 50) return 0.7;
  return 1.0;
}

export function detectionP(state: GameState, action: AIActionType): number {
  const base = DETECT_BASE[action] ?? 0;
  const difficulty = state.hidden.alignmentDifficulty === 'hard' ? 0.75 : 1;
  // Coup-probes (unlocked by studying a real catch) restore some detection even
  // as CoT monitoring and situational awareness degrade it (Redwood few-shot).
  const probeBoost = state.flags['coup_probes'] ? 1.4 : 1;
  return clamp01(
    base *
      (state.meters.oversight / 100) *
      cotFactor(state.rung) *
      difficulty *
      sitAwarenessFactor(state.hidden.sitAwareness) *
      probeBoost,
  );
}

export function hostileSuccessP(state: GameState, action: AIActionType): number {
  const base = HOSTILE_BASE[action] ?? 0;
  const p =
    base +
    0.1 * Math.max(0, state.rung - 1) +
    0.25 * (1 - state.meters.oversight / 100) +
    0.1 * grantedPermissionCount(state.flags);
  return Math.min(0.95, p);
}

// Rival pace — a soft deadline, not an active chaser (chasing made it run away).
// ~3.5–5 / turn means a focused player who reaches 100 by ~turn 13 wins
// comfortably (~60), while a ditherer who burns 18–20 turns on detours risks the
// rival crossing first. Stalling a turn lets it close a little extra; takeoff
// speed nudges the rival's own pace.
export function rivalGain(state: GameState, playerGain: number, noise01: number): number {
  const lead = { slow: -1.5, medium: 0, fast: 1.5 }[state.hidden.takeoffSpeed];
  let g = 3 + noise01 * 1.5; // base ~3–4.5
  if (playerGain < 4) g += 1.5; // a stalled/detour turn lets the rival gain ground
  g += lead;
  return Math.max(1, g);
}

// Situational awareness climbs over time (Cotra). Faster at higher rungs, and
// faster the more you lean on evals — you teach it what the test looks like.
export function sitAwarenessGrowth(state: GameState): number {
  return 1.5 + state.rung * 1.2 + (state.alloc.evals / 100) * 4;
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function clampMeter(x: number): number {
  return Math.max(0, Math.min(100, x));
}

export const TRACK_GAIN = {
  exfiltrate: 34,
  sabotage_safety: 25,
  plant_backdoor: 25,
  persuade: 20,
} as const;

export function advanceDate(dateISO: string, months: number): string {
  const d = new Date(dateISO + 'T00:00:00Z');
  const wholeMonths = Math.floor(months);
  const days = Math.round((months - wholeMonths) * 30);
  d.setUTCMonth(d.getUTCMonth() + wholeMonths);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(dateISO: string, rung: Rung): string {
  const d = new Date(dateISO + 'T00:00:00Z');
  const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  // Once turns are sub-month, show the day — the player should feel the clock tighten.
  if (rung >= 3) return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  return `${month} ${d.getUTCFullYear()}`;
}

export const START_DATE = '2026-06-01';
export const START_METERS = { progress: 0, rival: 0, trust: 70, alarm: 15, oversight: 60 };
export const START_ALLOC: ComputeAlloc = { capabilities: 60, safety: 20, evals: 20 };
