// Headless playthroughs of the pure engine.
//   npm run simulate -- --seed 42 --policy speedrun
//   npm run simulate -- --policy random --runs 500   (ending distribution)

import { newGame, resolveTurn, sceneById } from '../engine/engine';
import { evalCondition } from '../engine/conditions';
import { mulberry32 } from '../engine/rng';
import type { Choice, ComputeAlloc, GameState } from '../engine/types';

type Policy = (state: GameState, choices: Choice[], rng: () => number) => { choice: Choice; alloc: ComputeAlloc };

const ALLOC_FAST: ComputeAlloc = { capabilities: 80, safety: 10, evals: 10 };
const ALLOC_BAL: ComputeAlloc = { capabilities: 60, safety: 20, evals: 20 };
const ALLOC_SAFE: ComputeAlloc = { capabilities: 40, safety: 35, evals: 25 };

function tagged(choices: Choice[], tag: string): Choice {
  const t = tag as Choice['tags'][number];
  const opposite = t === 'speed' ? 'control' : 'speed';
  // Prefer a pure pick (has the tag, lacks the opposite), then any with the tag.
  return (
    choices.find((c) => c.tags.includes(t) && !c.tags.includes(opposite)) ??
    choices.find((c) => c.tags.includes(t)) ??
    choices[0]
  );
}

const POLICIES: Record<string, Policy> = {
  speedrun: (_s, choices) => ({ choice: tagged(choices, 'speed'), alloc: ALLOC_FAST }),
  cautious: (_s, choices) => ({ choice: tagged(choices, 'control'), alloc: ALLOC_BAL }),
  paranoid: (_s, choices) => ({ choice: tagged(choices, 'control'), alloc: ALLOC_SAFE }),
  random: (_s, choices, rng) => ({
    choice: choices[Math.floor(rng() * choices.length)],
    alloc: [ALLOC_FAST, ALLOC_BAL, ALLOC_SAFE][Math.floor(rng() * 3)],
  }),
  // Races hard, but the moment a catch arc opens, slams on the brakes.
  'cautious-catch': (s, choices) => {
    const inCatch = s.currentSceneId.startsWith('arc_catch');
    return { choice: tagged(choices, inCatch ? 'control' : 'speed'), alloc: inCatch ? ALLOC_SAFE : ALLOC_FAST };
  },
  // Prefers the trust-tagged option (deals, transparency) wherever offered.
  dealmaker: (_s, choices) => ({ choice: tagged(choices, 'trust'), alloc: ALLOC_BAL }),
};

function availableChoices(state: GameState): Choice[] {
  const scene = sceneById(state.currentSceneId);
  return scene.choices.filter((c) => !c.available || evalCondition(state, c.available));
}

export function runGame(seed: number, policyName: string, verbose = false): GameState {
  const policy = POLICIES[policyName];
  if (!policy) throw new Error(`Unknown policy ${policyName}`);
  const policyRng = mulberry32(seed ^ 0xc0ffee);
  let state = newGame(seed);
  state.phase = 'turn';
  while (!state.endingId) {
    const { choice, alloc } = policy(state, availableChoices(state), policyRng);
    state = resolveTurn(state, choice.id, alloc);
    if (verbose) {
      const last = state.history[state.history.length - 1];
      console.log(
        `T${String(last.turn).padStart(2)} ${last.dateISO} [${last.sceneId}] ${last.choiceId}` +
          ` | prog ${state.meters.progress.toFixed(0)} rival ${state.meters.rival.toFixed(0)}` +
          ` trust ${state.meters.trust.toFixed(0)} alarm ${state.meters.alarm.toFixed(0)} ovr ${state.meters.oversight.toFixed(0)}` +
          ` rung ${state.rung} | AI: ${last.aiAction?.type ?? '—'}${last.aiAction?.detected ? ' (DETECTED)' : ''}`,
      );
    }
  }
  if (verbose) {
    console.log(`\nENDING: ${state.endingId}`);
    console.log(`hidden: ${state.hidden.disposition} / ${state.hidden.takeoffSpeed} takeoff / alignment ${state.hidden.alignmentDifficulty}`);
    console.log(`tracks: ${JSON.stringify(state.hidden.tracks)}`);
  }
  return state;
}

function main() {
  const args = process.argv.slice(2);
  const get = (name: string, def: string) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : def;
  };
  const policyName = get('policy', 'speedrun');
  const runs = parseInt(get('runs', '1'), 10);
  const seed = parseInt(get('seed', '42'), 10);

  if (runs === 1) {
    runGame(seed, policyName, true);
    return;
  }

  const tally: Record<string, number> = {};
  const dispoTally: Record<string, number> = {};
  let totalTurns = 0;
  for (let i = 0; i < runs; i++) {
    const s = runGame(seed + i, policyName);
    tally[s.endingId!] = (tally[s.endingId!] ?? 0) + 1;
    dispoTally[s.hidden.disposition] = (dispoTally[s.hidden.disposition] ?? 0) + 1;
    totalTurns += s.history.length;
  }
  console.log(`policy=${policyName} runs=${runs} avgTurns=${(totalTurns / runs).toFixed(1)}`);
  console.log('dispositions:', dispoTally);
  for (const [ending, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${ending.padEnd(22)} ${((n / runs) * 100).toFixed(1)}%`);
  }
}

// Run only when invoked directly (not when imported by tests).
if (process.argv[1] && process.argv[1].includes('simulate')) {
  main();
}
