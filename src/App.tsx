import { useEffect, useMemo, useState } from 'react';
import type { GameState } from './engine/types';
import { newGame, resolveTurn, sceneById } from './engine/engine';
import { allAssetUrls, IS_MOBILE } from './content/characters';
import { DebriefScreen, EndingScreen, LoadingScreen, MilestoneOverlay, TitleScreen, TurnScreen } from './ui/screens';
import { DebugPanel } from './ui/components';

const PRELOAD_CONCURRENCY = 8;

/** Preload every sprite and background up front so nothing pops in mid-scene.
 *  Desktop only — phones lazy-load each scene's art on demand, so we never hold
 *  the whole set decoded in memory at once (that burst was crashing mobile
 *  Safari). Returns 0..1 progress; a missing file counts as done. */
function useAssetPreload(): number {
  const [done, setDone] = useState(0);
  const urls = useMemo(allAssetUrls, []);
  useEffect(() => {
    if (IS_MOBILE) return; // lazy-load on phones
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
      img.onload = () => (img.decode ? img.decode().then(finish, finish) : finish());
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
  }, [urls]);
  return IS_MOBILE ? 1 : urls.length ? done / urls.length : 1;
}

export default function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const debug = params.get('debug') === '1';
  const urlSeed = params.get('seed');

  const progress = useAssetPreload();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (progress >= 1) setReady(true);
  }, [progress]);

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
