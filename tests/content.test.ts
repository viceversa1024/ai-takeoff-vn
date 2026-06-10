// Static content validation: catches writer errors at test time, not mid-game.

import { describe, expect, it } from 'vitest';
import { allScenes, endings, evidenceTemplates } from '../src/content';
import { BACKGROUNDS, CHARACTERS } from '../src/content/characters';
import type { Condition, Effect, VignetteBlock } from '../src/engine/types';

function* walkEffects(effects: Effect[]): Generator<Effect> {
  for (const e of effects) {
    yield e;
    if ('roll' in e) {
      yield* walkEffects(e.roll.success);
      yield* walkEffects(e.roll.fail);
    }
  }
}

function* walkConditions(c: Condition): Generator<Condition> {
  yield c;
  if ('all' in c) for (const sub of c.all) yield* walkConditions(sub);
  if ('any' in c) for (const sub of c.any) yield* walkConditions(sub);
  if ('not' in c) yield* walkConditions(c.not);
}

describe('content integrity', () => {
  it('every spine slot 1–12 has a prereq-free fallback variant', () => {
    for (let slot = 1; slot <= 12; slot++) {
      const variants = allScenes.filter((s) => s.slot === slot);
      expect(variants.length, `slot ${slot} has no scenes`).toBeGreaterThan(0);
      expect(
        variants.some((v) => !v.prereq),
        `slot ${slot} has no prereq-free fallback`,
      ).toBe(true);
    }
  });

  it('every scene has 2–4 choices with unique ids', () => {
    for (const scene of allScenes) {
      expect(scene.choices.length, scene.id).toBeGreaterThanOrEqual(2);
      expect(scene.choices.length, scene.id).toBeLessThanOrEqual(4);
      const ids = new Set(scene.choices.map((c) => c.id));
      expect(ids.size, `duplicate choice ids in ${scene.id}`).toBe(scene.choices.length);
    }
  });

  it('all queued incident ids exist in the incident pool', () => {
    const incidentIds = new Set(allScenes.filter((s) => s.slot === 'incident').map((s) => s.id));
    for (const scene of allScenes) {
      for (const choice of scene.choices) {
        for (const eff of walkEffects(choice.effects)) {
          if ('queueIncident' in eff) {
            expect(incidentIds.has(eff.queueIncident), `${scene.id}/${choice.id} queues unknown incident ${eff.queueIncident}`).toBe(true);
          }
        }
      }
    }
  });

  it('every trace template has a paired noise template that exists', () => {
    const ids = new Set(evidenceTemplates.map((t) => t.id));
    for (const t of evidenceTemplates.filter((t) => t.source === 'trace')) {
      expect(t.pairedNoiseId, `${t.id} missing pairedNoiseId`).toBeTruthy();
      expect(ids.has(t.pairedNoiseId!), `${t.id} pairs to unknown ${t.pairedNoiseId}`).toBe(true);
      expect(t.forAction, `${t.id} missing forAction`).toBeTruthy();
    }
  });

  it('hiddenDisposition conditions never appear in scene prereqs or choices', () => {
    for (const scene of allScenes) {
      const conds: Condition[] = [];
      if (scene.prereq) conds.push(scene.prereq);
      for (const choice of scene.choices) if (choice.available) conds.push(choice.available);
      for (const c of conds) {
        for (const sub of walkConditions(c)) {
          expect('hiddenDisposition' in sub, `${scene.id} leaks hidden disposition into player-visible branching`).toBe(false);
        }
      }
    }
  });

  it('all ending ids referenced by the engine have copy', () => {
    const copyIds = new Set(endings.map((e) => e.id));
    for (const id of [
      'takeover_silent',
      'takeover_overt',
      'contained_barely',
      'aligned_takeoff',
      'emperors_new_model',
      'ousted',
      'nationalized',
      'shut_down',
      'rival_wins',
      'you_lived',
      // Phase 2
      'shutdown_justified',
      'shutdown_innocent',
      'deal_held',
      'slowdown_coalition',
      'merged_frontier',
      'committee_runs_it',
    ]) {
      expect(copyIds.has(id), `missing ending copy: ${id}`).toBe(true);
    }
  });

  it('all engine-queued arc beats exist as scenes', () => {
    const ids = new Set(allScenes.map((s) => s.id));
    // Beats the engine pushes directly (not via choice effects).
    for (const id of ['arc_catch_1', 'arc_rsp_1', 'arc_theft_1', 'arc_merger_1', 'arc_slowdown_1']) {
      expect(ids.has(id), `engine queues missing scene ${id}`).toBe(true);
    }
  });

  it('every variantOf points at a real queued beat id', () => {
    const ids = new Set(allScenes.map((s) => s.id));
    for (const s of allScenes) {
      if (s.variantOf) expect(ids.has(s.variantOf), `${s.id} variantOf unknown ${s.variantOf}`).toBe(true);
    }
  });

  it('every scene includes an evidenceSlot block', () => {
    for (const scene of allScenes) {
      expect(
        scene.vignette.some((b) => b.type === 'evidenceSlot'),
        `${scene.id} has no evidenceSlot`,
      ).toBe(true);
    }
  });

  it('every line speaker exists in the character manifest, with a known expression', () => {
    const allBlocks: { where: string; block: VignetteBlock }[] = [];
    for (const scene of allScenes) {
      for (const b of scene.vignette) allBlocks.push({ where: scene.id, block: b });
      for (const choice of scene.choices) {
        for (const b of choice.reaction ?? []) allBlocks.push({ where: `${scene.id}/${choice.id}`, block: b });
      }
    }
    for (const t of evidenceTemplates) allBlocks.push({ where: `evidence:${t.id}`, block: t.block });

    for (const { where, block } of allBlocks) {
      if (block.type !== 'line') continue;
      const ch = CHARACTERS[block.speaker];
      expect(ch, `${where}: unknown speaker "${block.speaker}"`).toBeTruthy();
      if (block.expression !== undefined) {
        expect(
          ch.expressions.includes(block.expression),
          `${where}: speaker "${block.speaker}" has no expression "${block.expression}"`,
        ).toBe(true);
      }
    }
  });

  it('every scene background id exists', () => {
    for (const scene of allScenes) {
      if (scene.bg) expect(BACKGROUNDS[scene.bg], `${scene.id}: unknown bg "${scene.bg}"`).toBeTruthy();
    }
  });
});
