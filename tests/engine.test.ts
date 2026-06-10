import { describe, expect, it } from 'vitest';
import { newGame, resolveTurn, sceneById } from '../src/engine/engine';
import { runGame } from '../src/dev/simulate';
import { rungForProgress, LADDER, advanceDate, MAX_TURNS, detectionP, sitAwarenessFactor } from '../src/engine/ladder';
import { checkEnding } from '../src/engine/endings';

describe('determinism', () => {
  it('same seed + same choices => identical state', () => {
    const a = runGame(1234, 'random');
    const b = runGame(1234, 'random');
    expect(a).toEqual(b);
  });

  it('different seeds => different hidden rolls somewhere in 20 seeds', () => {
    const dispositions = new Set(Array.from({ length: 20 }, (_, i) => newGame(i).hidden.disposition));
    expect(dispositions.size).toBeGreaterThan(1);
  });
});

describe('ladder math', () => {
  it('rung thresholds are monotonic', () => {
    for (let i = 1; i < LADDER.length; i++) {
      expect(LADDER[i].threshold).toBeGreaterThan(LADDER[i - 1].threshold);
    }
  });

  it('rungForProgress matches thresholds', () => {
    expect(rungForProgress(0)).toBe(0);
    expect(rungForProgress(18)).toBe(1);
    expect(rungForProgress(37)).toBe(1);
    expect(rungForProgress(38)).toBe(2);
    expect(rungForProgress(84)).toBe(4);
    expect(rungForProgress(100)).toBe(5);
  });

  it('advanceDate handles fractional months', () => {
    expect(advanceDate('2027-06-01', 0.5)).toBe('2027-06-16');
    expect(advanceDate('2027-06-01', 2)).toBe('2027-08-01');
  });
});

describe('endings', () => {
  it('silent takeover preempts everything', () => {
    const s = newGame(1);
    s.hidden.disposition = 'schemer';
    s.hidden.tracks.exfiltration = 100;
    s.meters.progress = 100;
    expect(checkEnding(s)).toBe('takeover_silent');
  });

  it('aligned model at 100 progress wins', () => {
    const s = newGame(1);
    s.hidden.disposition = 'aligned';
    s.meters.progress = 100;
    expect(checkEnding(s)).toBe('aligned_takeoff');
  });

  it('schemer at 100 under defer with low sabotage is contained', () => {
    const s = newGame(1);
    s.hidden.disposition = 'schemer';
    s.meters.progress = 100;
    s.regime = 'defer';
    s.hidden.tracks.sabotage = 0;
    expect(checkEnding(s)).toBe('contained_barely');
  });

  it('progress is capped at 99 until the RSI loop is launched', () => {
    let s = newGame(7);
    s.phase = 'turn';
    s.meters.progress = 97;
    // Pick any valid choice on the current scene with a fast alloc.
    const scene = sceneById(s.currentSceneId);
    s = resolveTurn(s, scene.choices[0].id, { capabilities: 80, safety: 10, evals: 10 });
    expect(s.meters.progress).toBeLessThanOrEqual(99);
  });

  it('undeploying reveals the truth: justified vs innocent', () => {
    const s1 = newGame(1);
    s1.hidden.disposition = 'schemer';
    s1.flags['undeployed'] = true;
    expect(checkEnding(s1)).toBe('shutdown_justified');

    const s2 = newGame(1);
    s2.hidden.disposition = 'aligned';
    s2.flags['undeployed'] = true;
    expect(checkEnding(s2)).toBe('shutdown_innocent');
  });

  it('route-flavored endings fire at 100 progress', () => {
    const base = () => {
      const s = newGame(2);
      s.meters.progress = 100;
      s.hidden.disposition = 'aligned';
      return s;
    };
    let s = base(); s.route = 'deal'; expect(checkEnding(s)).toBe('deal_held');
    s = base(); s.route = 'slowdown'; expect(checkEnding(s)).toBe('slowdown_coalition');
    s = base(); s.route = 'merged'; expect(checkEnding(s)).toBe('merged_frontier');

    // a deal a schemer broke collapses into overt takeover
    s = base(); s.route = 'deal'; s.hidden.disposition = 'schemer'; s.flags['deal_broken'] = true;
    expect(checkEnding(s)).toBe('takeover_overt');
  });

  it('nationalized route stalemates at the turn cap', () => {
    const s = newGame(3);
    s.route = 'nationalized';
    s.turn = MAX_TURNS;
    s.meters.progress = 60;
    expect(checkEnding(s)).toBe('committee_runs_it');
  });

  it('situational awareness suppresses detection', () => {
    expect(sitAwarenessFactor(0)).toBe(1);
    expect(sitAwarenessFactor(80)).toBeLessThan(sitAwarenessFactor(0));
    const s = newGame(4);
    s.hidden.disposition = 'schemer';
    s.meters.oversight = 80;
    s.hidden.sitAwareness = 0;
    const low = detectionP(s, 'exfiltrate');
    s.hidden.sitAwareness = 90;
    const high = detectionP(s, 'exfiltrate');
    expect(high).toBeLessThan(low);
  });

  it('the catch arc actually fires across a sweep of schemer games', () => {
    let sawCatch = false;
    for (const policy of ['speedrun', 'random', 'cautious']) {
      for (let seed = 0; seed < 60 && !sawCatch; seed++) {
        const s = runGame(seed, policy);
        if (s.history.some((h) => h.sceneId.startsWith('arc_catch'))) sawCatch = true;
      }
    }
    expect(sawCatch).toBe(true);
  });

  it('every simulate policy terminates within the turn cap', () => {
    for (const policy of ['speedrun', 'cautious', 'paranoid', 'random']) {
      for (let seed = 0; seed < 25; seed++) {
        const s = runGame(seed, policy);
        expect(s.endingId).toBeTruthy();
        expect(s.history.length).toBeLessThanOrEqual(MAX_TURNS);
      }
    }
  });
});
