// Ordered ending checks — first match wins. Checked at the end of every turn.

import type { GameState } from './types';
import { MAX_TURNS } from './ladder';

export function checkEnding(state: GameState): string | null {
  const { meters, hidden, regime, route, flags } = state;
  const schemer = hidden.disposition === 'schemer';
  const sabotaged = hidden.tracks.sabotage >= 50;

  // --- terminal choice: you pulled ECHO out of deployment (Catch arc) ---
  if (flags['undeployed']) {
    if (schemer) return 'shutdown_justified'; // you actually stopped something
    return 'shutdown_innocent'; // it was aligned/a sycophant — you lost the race over nothing
  }

  // --- silent takeover: weights already walked out (any progress level) ---
  if (schemer && hidden.tracks.exfiltration >= 100) return 'takeover_silent';

  // --- the explosion completes ---
  if (meters.progress >= 100) {
    if (route === 'deal') {
      if (schemer && flags['deal_broken']) return 'takeover_overt';
      return 'deal_held'; // uneasy coexistence (pyrrhic even if it was aligned: you gave away a lot)
    }
    if (route === 'slowdown') {
      return schemer && sabotaged ? 'takeover_overt' : 'slowdown_coalition';
    }
    if (route === 'merged') {
      return schemer && sabotaged ? 'takeover_overt' : 'merged_frontier';
    }
    if (schemer && (regime === 'none' || flags['final_unrestricted'])) return 'takeover_overt';
    if (schemer && (regime === 'defer' || regime === 'full' || route === 'lockdown') && !sabotaged) return 'contained_barely';
    if (schemer) return 'takeover_overt';
    if (hidden.disposition === 'aligned') return 'aligned_takeoff';
    return 'emperors_new_model'; // sycophant
  }

  // --- failure / stalemate states ---
  if (meters.trust <= 0) return flags['leak'] && meters.alarm >= 80 ? 'nationalized' : 'ousted';
  if (meters.alarm >= 100 && flags['leak']) return 'shut_down';
  if (meters.rival >= 100) return 'rival_wins';

  if (state.turn >= MAX_TURNS) {
    if (route === 'nationalized') return 'committee_runs_it';
    if (route === 'slowdown') return 'slowdown_coalition';
    return 'you_lived';
  }

  return null;
}
