// Pure game engine: newGame(seed) and resolveTurn(state, choiceId, alloc).
// No React, no I/O. The UI dispatches into this; simulate.ts drives it headless.

import type { ComputeAlloc, GameState, Rung, Scene, TurnRecord } from './types';
import { stream } from './rng';
import {
  advanceDate,
  clampMeter,
  MAX_TURNS,
  progressGain,
  rivalGain,
  rungForProgress,
  rungSpec,
  sitAwarenessGrowth,
  START_ALLOC,
  START_DATE,
  START_METERS,
} from './ladder';
import { applyEffects, evalCondition } from './conditions';
import { takeAIAction } from './aiActor';
import { generateEvidence } from './evidence';
import { checkEnding } from './endings';
import { allScenes } from '../content';

export function newGame(seed: number): GameState {
  const rng = stream(seed, 'setup', 0);

  const dRoll = rng();
  const disposition = dRoll < 0.45 ? 'aligned' : dRoll < 0.7 ? 'sycophant' : 'schemer';
  const sRoll = rng();
  const takeoffSpeed = sRoll < 0.25 ? 'slow' : sRoll < 0.75 ? 'medium' : 'fast';
  const alignmentDifficulty = rng() < 0.5 ? 'hard' : 'easy';

  const state: GameState = {
    seed,
    phase: 'title',
    turn: 1,
    dateISO: START_DATE,
    rung: 0,
    multiplier: 1,
    regime: 'none',
    route: 'open',
    evidenceQuality: 0,
    catchPending: false,
    hidden: {
      disposition,
      takeoffSpeed,
      alignmentDifficulty,
      tracks: { exfiltration: 0, sabotage: 0, backdoors: 0, persuasion: 0 },
      caution: 0,
      inflationDebt: 0,
      sitAwareness: 0,
    },
    meters: { ...START_METERS },
    alloc: { ...START_ALLOC },
    flags: {},
    pendingEvidence: [],
    incidentQueue: [],
    currentSceneId: '',
    pendingMilestone: null,
    endingId: null,
    seenSpeakers: [],
    history: [],
  };
  state.currentSceneId = selectScene(state).id;
  return state;
}

export function sceneById(id: string): Scene {
  const s = allScenes.find((sc) => sc.id === id);
  if (!s) throw new Error(`Unknown scene: ${id}`);
  return s;
}

/** Pick the scene for the current turn: queued incident first, else spine slot variant. */
export function selectScene(state: GameState): Scene {
  if (state.incidentQueue.length > 0) {
    const id = state.incidentQueue[0];
    // A queued id may have prereq variants (arc beats that fork on hidden state).
    const pool = allScenes.filter((s) => s.id === id || s.variantOf === id);
    for (const v of pool) {
      if (!v.prereq || evalCondition(state, v.prereq)) return v;
    }
    const exact = allScenes.find((s) => s.id === id);
    if (exact) return exact;
  }
  const slot = spineSlotForTurn(state);
  const variants = allScenes.filter((s) => s.slot === slot);
  for (const v of variants) {
    if (!v.prereq || evalCondition(state, v.prereq)) return v;
  }
  // Content test guarantees a prereq-free fallback per slot; this is a hard error otherwise.
  throw new Error(`No matching scene variant for slot ${slot}`);
}

const HOSTILE_TYPES = new Set(['sandbag', 'sabotage_safety', 'plant_backdoor', 'exfiltrate', 'persuade', 'disable_monitoring']);

/** Decide whether this turn's hidden action (or noise) escalates into the Catch arc. */
function maybeQueueCatch(state: GameState, aiAction: ReturnType<typeof takeAIAction>, rng: ReturnType<typeof stream>): void {
  if (state.catchPending || state.flags['catch_done']) return;
  if (state.incidentQueue.length > 0) return; // don't interrupt another arc

  // Real catch: a detected hostile action whose agenda is already underway.
  const realCatch =
    aiAction != null &&
    aiAction.detected &&
    HOSTILE_TYPES.has(aiAction.type) &&
    state.turn >= 3;

  // False catch: in a NON-schemer world, ambiguous noise can still snowball into
  // a full "caught red-handed" panic. Likelier when alarm is high and you've been
  // drowning in eval flags.
  let falseCatch = false;
  if (!realCatch && state.hidden.disposition !== 'schemer' && state.turn >= 5) {
    const p = 0.012 + 0.0008 * state.meters.alarm + 0.0008 * state.alloc.evals;
    falseCatch = rng() < p;
  }

  if (realCatch || falseCatch) {
    state.catchPending = true;
    state.flags['catch_is_false'] = falseCatch && !realCatch;
    state.incidentQueue.push('arc_catch_1');
  }
}

/** One-time triggers for the non-catch arcs. At most one queues per turn. */
function maybeQueueArcs(state: GameState, rungIncreased: boolean, rng: ReturnType<typeof stream>): void {
  if (state.catchPending || state.incidentQueue.length > 0) return;
  const f = state.flags;
  const queue = (id: string, doneFlag: string) => {
    f[doneFlag] = true;
    state.incidentQueue.push(id);
  };

  // RSP tripwire: your own framework's threshold trips on a rung-up while the
  // safety team is already alarmed.
  if (rungIncreased && !f['rsp_done'] && state.meters.alarm >= 50 && state.rung >= 2) {
    return queue('arc_rsp_1', 'rsp_done');
  }
  // Weight theft: a real risk once the model is worth stealing.
  if (!f['theft_done'] && state.rung >= 2 && state.turn >= 6 && rng() < 0.12) {
    return queue('arc_theft_1', 'theft_done');
  }
  // Merger: when the rival pulls close, consolidation sometimes gets proposed.
  if (!f['merger_done'] && state.route === 'open' && state.meters.rival >= 58 && state.turn >= 8 && rng() < 0.4) {
    return queue('arc_merger_1', 'merger_done');
  }
  // Slowdown vs Race: the pivotal late fork. Fires on accumulated alarm OR once a
  // catch has put the lab under a microscope (lockdown route).
  if (
    !f['slowdown_done'] &&
    state.turn >= 9 &&
    state.rung >= 2 &&
    (state.meters.alarm >= 55 || state.route === 'lockdown') &&
    state.route !== 'nationalized' &&
    state.route !== 'slowdown'
  ) {
    return queue('arc_slowdown_1', 'slowdown_done');
  }
}

/** Spine slot = turn number minus incidents already played, capped at 12. */
function spineSlotForTurn(state: GameState): number {
  const incidentsPlayed = state.history.filter((h) => {
    const sc = allScenes.find((s) => s.id === h.sceneId);
    return sc?.slot === 'incident';
  }).length;
  return Math.min(12, state.turn - incidentsPlayed);
}

// Compute allocation is no longer a player lever — it stays fixed at the
// BALANCED split (START_ALLOC) and all agency lives in the dialogue choices.
// The optional `_alloc` param is retained for call-site compatibility and ignored.
export function resolveTurn(prev: GameState, choiceId: string, _alloc?: ComputeAlloc): GameState {
  const state: GameState = structuredClone(prev);
  const scene = sceneById(state.currentSceneId);
  const choice = scene.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`Unknown choice ${choiceId} in scene ${scene.id}`);

  const rolls: TurnRecord['rolls'] = [];
  const metersBefore = { ...state.meters };
  const evidenceShown = [...state.pendingEvidence];
  state.pendingEvidence = [];

  // 1–2. Apply choice effects (allocation is fixed at BALANCED, set in newGame).
  const rngChoice = stream(state.seed, 'choiceRolls', state.turn);
  applyEffects(state, choice.effects, rngChoice, rolls);

  // If this scene was the queued incident (possibly via a variant), consume it.
  if (state.incidentQueue.length > 0 && (state.incidentQueue[0] === scene.id || state.incidentQueue[0] === scene.variantOf)) {
    state.incidentQueue.shift();
  }
  // The Catch arc clears its pending flag once its final beat sets catch_done.
  if (state.flags['catch_done']) state.catchPending = false;

  // 3. Hidden AI action.
  const rngAction = stream(state.seed, 'aiAction', state.turn);
  const rngDetect = stream(state.seed, 'detection', state.turn);
  const aiAction = takeAIAction(state, rngAction, rngDetect, rolls);

  // 4. Evidence for NEXT turn.
  const rngNoise = stream(state.seed, 'noise', state.turn);
  state.pendingEvidence = generateEvidence(state, aiAction, rngNoise, rolls);

  // 5. Meter updates: progress, rival, alarm decay, oversight decay.
  const gain = progressGain(state) + (aiAction?.type === 'helpful' ? 1.5 : 0) + (aiAction?.type === 'inflate' ? 2.5 : 0);
  state.meters.progress = clampMeter(state.meters.progress + gain);
  // The explosion can't complete until the player launches the RSI loop (slot 12):
  // the final handoff is a decision, not a drift.
  if (!state.flags['launched_rsi']) state.meters.progress = Math.min(state.meters.progress, 99);

  const rngRival = stream(state.seed, 'rival', state.turn);
  state.meters.rival = clampMeter(state.meters.rival + rivalGain(state, gain, rngRival()));

  const alarmDecay = (state.alloc.safety / 15) * (state.hidden.alignmentDifficulty === 'hard' ? 0.5 : 1);
  state.meters.alarm = clampMeter(state.meters.alarm - alarmDecay);

  if (state.rung >= 3 && state.regime !== 'defer' && state.regime !== 'full') {
    state.meters.oversight = clampMeter(state.meters.oversight - 5); // CoT monitoring degrading
  }

  // Situational awareness climbs (Cotra). The lockdown/deal routes keep it
  // partially in check (more eyes, blunter affordances).
  let saGain = sitAwarenessGrowth(state);
  if (state.route === 'lockdown' || state.route === 'nationalized') saGain *= 0.6;
  state.hidden.sitAwareness = clampMeter(state.hidden.sitAwareness + saGain);

  // Catch trigger: a detected hostile action with a meaningful agenda behind it
  // becomes a multi-scene Catch arc — OR, in a NON-schemer world, a rare strong
  // false-positive cascade does the same (you can be wrong; Redwood/Cotra both
  // stress the ambiguity). Only one catch arc per game.
  maybeQueueCatch(state, aiAction, stream(state.seed, 'noise', state.turn + 7777));

  // 6. Rung check.
  const newRung = rungForProgress(state.meters.progress);
  const rungIncreased = newRung > state.rung && newRung < 5;
  if (rungIncreased) {
    state.rung = newRung as Rung;
    state.pendingMilestone = state.rung;
    state.flags[`milestone_r${state.rung}`] = true;
  }

  // 6b. Non-catch arc triggers (one each per game; never interrupt another arc).
  maybeQueueArcs(state, rungIncreased, stream(state.seed, 'noise', state.turn + 4242));

  // 7. Tempo advance.
  state.dateISO = advanceDate(state.dateISO, rungSpec(state.rung).monthsPerTurn);

  // 8. Ending check.
  const endingId = checkEnding(state);

  // 8b. Record which characters have now been seen (drives one-time role intros).
  for (const block of [...scene.vignette, ...(choice.reaction ?? [])]) {
    if (block.type === 'line' && !state.seenSpeakers.includes(block.speaker)) {
      state.seenSpeakers.push(block.speaker);
    }
  }

  // 9. Record history, advance.
  state.history.push({
    turn: state.turn,
    dateISO: prev.dateISO,
    sceneId: scene.id,
    choiceId: choice.id,
    choiceLabel: choice.label,
    alloc: { ...state.alloc },
    metersBefore,
    metersAfter: { ...state.meters },
    aiAction,
    evidenceShown,
    rolls,
  });

  if (endingId) {
    state.endingId = endingId;
    state.phase = 'ending';
    return state;
  }

  state.turn += 1;
  state.currentSceneId = selectScene(state).id;
  state.phase = 'turn';
  return state;
}

export function normalizeAlloc(alloc: ComputeAlloc): ComputeAlloc {
  const total = alloc.capabilities + alloc.safety + alloc.evals;
  if (total <= 0) return { capabilities: 34, safety: 33, evals: 33 };
  return {
    capabilities: Math.round((alloc.capabilities / total) * 100),
    safety: Math.round((alloc.safety / total) * 100),
    evals: 100 - Math.round((alloc.capabilities / total) * 100) - Math.round((alloc.safety / total) * 100),
  };
}

export { MAX_TURNS };
