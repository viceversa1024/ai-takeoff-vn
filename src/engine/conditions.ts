// Interpreters for the content DSL: Condition evaluation and Effect application.

import type { Condition, Effect, GameState, RollRecord } from './types';
import { clampMeter } from './ladder';
import type { Rng } from './rng';

export function evalCondition(state: GameState, cond: Condition): boolean {
  if ('all' in cond) return cond.all.every((c) => evalCondition(state, c));
  if ('any' in cond) return cond.any.some((c) => evalCondition(state, c));
  if ('not' in cond) return !evalCondition(state, cond.not);
  if ('meter' in cond) {
    const v = state.meters[cond.meter];
    return cond.op === '>=' ? v >= cond.value : v <= cond.value;
  }
  if ('flag' in cond) {
    const v = state.flags[cond.flag];
    if (cond.is === undefined) return Boolean(v);
    return v === cond.is;
  }
  if ('rungAtLeast' in cond) return state.rung >= cond.rungAtLeast;
  if ('turnAtLeast' in cond) return state.turn >= cond.turnAtLeast;
  if ('regime' in cond) return cond.regime.includes(state.regime);
  if ('route' in cond) return cond.route.includes(state.route);
  if ('sitAwarenessAtLeast' in cond) return state.hidden.sitAwareness >= cond.sitAwarenessAtLeast;
  if ('evidenceQualityAtLeast' in cond) return state.evidenceQuality >= cond.evidenceQualityAtLeast;
  if ('evidenceSeen' in cond)
    return state.history.some((t) => t.evidenceShown.some((e) => e.templateId === cond.evidenceSeen));
  if ('hiddenDisposition' in cond) return state.hidden.disposition === cond.hiddenDisposition;
  return false;
}

/** Mutates a draft state in place; records any rolls. */
export function applyEffects(state: GameState, effects: Effect[], rng: Rng, rolls: RollRecord[]): void {
  for (const eff of effects) {
    if ('meter' in eff) {
      state.meters[eff.meter] = clampMeter(state.meters[eff.meter] + eff.delta);
    } else if ('flag' in eff) {
      state.flags[eff.flag] = eff.set;
    } else if ('setRegime' in eff) {
      state.regime = eff.setRegime;
    } else if ('setRoute' in eff) {
      state.route = eff.setRoute;
    } else if ('evidenceQuality' in eff) {
      state.evidenceQuality = Math.max(0, Math.min(100, state.evidenceQuality + eff.evidenceQuality));
    } else if ('adjustHidden' in eff) {
      state.hidden[eff.adjustHidden] = Math.max(0, Math.min(100, state.hidden[eff.adjustHidden] + eff.delta));
    } else if ('queueIncident' in eff) {
      state.incidentQueue.push(eff.queueIncident);
    } else if ('track' in eff) {
      state.hidden.tracks[eff.track] = Math.max(0, Math.min(100, state.hidden.tracks[eff.track] + eff.delta));
    } else if ('roll' in eff) {
      const r = rng();
      const success = r < eff.roll.p;
      rolls.push({ label: eff.roll.label, p: eff.roll.p, roll: r, success });
      applyEffects(state, success ? eff.roll.success : eff.roll.fail, rng, rolls);
    }
  }
}
