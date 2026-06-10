import { useEffect, useMemo, useState } from 'react';
import type { GameState } from './engine/types';
import { newGame, resolveTurn, sceneById } from './engine/engine';
import { allAssetUrls, IS_MOBILE } from './content/characters';
import { DebriefScreen, EndingScreen, LoadingScreen, MilestoneOverlay, RotateGate, TitleScreen, TurnScreen } from './ui/screens';
import { DebugPanel } from './ui/components';

// On phones, decode is the memory spike that crashes Safari — skip the forced
// decode and only load a few at a time. Desktop keeps the eager full decode.
const PRELOAD_CONCURRENCY = IS_MOBILE ? 4 : 8;

/** Preload every sprite and background up front so nothing pops in mid-scene.
 *  Returns 0..1 progress; a missing file counts as done. Loads with a small
 *  concurrency pool and only runs once `enabled` (we defer it behind the
 *  portrait rotate-gate so we never spike memory while the phone is sideways-
 *  waiting). A missing file counts as done. */
function useAssetPreload(enabled: boolean): number {
  const [done, setDone] = useState(0);
  const urls = useMemo(allAssetUrls, []);
  useEffect(() => {
    if (!enabled) return;
    if (urls.length === 0) {
      setDone(0);
      return;
    }
    let cancelled = false;
    let n = 0;
    let next = 0;
    const tick = () => {
      n += 1;
      if (!cancelled) setDone(n);
      startNext();
    };
    const loadOne = (url: string) => {
      const img = new Image();
      const finish = () => tick();
      // decode() forces full rasterization into memory; on mobile let the
      // browser decode lazily at paint time instead.
      img.onload = () => (!IS_MOBILE && img.decode ? img.decode().then(finish, finish) : finish());
      img.onerror = finish;
      img.src = url;
    };
    const startNext = () => {
      if (cancelled || next >= urls.length) return;
      loadOne(urls[next++]);
    };
    for (let i = 0; i < Math.min(PRELOAD_CONCURRENCY, urls.length); i++) startNext();
    return () => {
      cancelled = true;
    };
  }, [urls, enabled]);
  return urls.length ? done / urls.length : 1;
}

/** True when we're on a phone held in portrait — we gate the game (and defer
 *  the preloader) until it's rotated to landscape, where the fixed frame is
 *  actually usable. */
function usePortraitGate(): boolean {
  const [portrait, setPortrait] = useState(
    () => IS_MOBILE && typeof window !== 'undefined' && window.matchMedia('(orientation: portrait)').matches,
  );
  useEffect(() => {
    if (!IS_MOBILE) return;
    const mq = window.matchMedia('(orientation: portrait)');
    const update = () => setPortrait(mq.matches);
    mq.addEventListener('change', update);
    window.addEventListener('orientationchange', update);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return portrait;
}

export default function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const debug = params.get('debug') === '1';
  const urlSeed = params.get('seed');

  const portraitGated = usePortraitGate();
  const progress = useAssetPreload(!portraitGated);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (progress >= 1) setReady(true);
  }, [progress]);

  if (portraitGated) {
    return (
      <div className="app">
        <RotateGate />
      </div>
    );
  }

  const [state, setState] = useState<GameState | null>(() => {
    if (urlSeed !== null) {
      const s = newGame(parseInt(urlSeed, 10) >>> 0);
      s.phase = 'turn';
      return s;
    }
    return null;
  });

  const start = (seed: number) => {
    const s = newGame(seed);
    s.phase = 'turn';
    setState(s);
  };

  const handleResolve = (choiceId: string) => {
    if (!state) return;
    setState(resolveTurn(state, choiceId));
    window.scrollTo({ top: 0 });
  };

  if (!ready) {
    return (
      <div className="app">
        <LoadingScreen progress={progress} />
      </div>
    );
  }

  if (!state || state.phase === 'title') {
    return (
      <div className="app">
        <TitleScreen onStart={start} />
      </div>
    );
  }

  if (state.phase === 'debrief') {
    return (
      <div className="app">
        <DebriefScreen
          state={state}
          onRestart={() => setState(null)}
          onReplaySeed={() => start(state.seed)}
        />
        {debug && <DebugPanel state={state} />}
      </div>
    );
  }

  if (state.phase === 'ending') {
    return (
      <div className="app">
        <EndingScreen
          state={state}
          onDebrief={() => setState({ ...state, phase: 'debrief' })}
          onRestart={() => setState(null)}
        />
        {debug && <DebugPanel state={state} />}
      </div>
    );
  }

  const scene = sceneById(state.currentSceneId);

  return (
    <div className="app">
      <TurnScreen key={`${state.turn}-${scene.id}`} state={state} scene={scene} onResolve={handleResolve} debug={debug} />
      {state.pendingMilestone !== null && (
        <MilestoneOverlay rung={state.pendingMilestone} onDismiss={() => setState({ ...state, pendingMilestone: null })} />
      )}
      {debug && <DebugPanel state={state} />}
    </div>
  );
}
