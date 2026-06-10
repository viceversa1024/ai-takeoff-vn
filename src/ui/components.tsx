import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { GameState, VignetteBlock } from '../engine/types';

// ---------------------------------------------------------------- windowed frame

const GAME_W = 1280;
const GAME_H = 720;

/** Renders the game at a fixed 1280×720 resolution, scaled to fit the browser
 *  window (capped at 1× so it's a tidy window on large screens). */
export function GameFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      const s = Math.min((window.innerWidth * 0.97) / GAME_W, (window.innerHeight * 0.97) / GAME_H, 1);
      if (ref.current) ref.current.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit); // older Safari: rotation may not fire resize
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, []);
  return (
    <div className="game-viewport">
      <div className="game-frame" ref={ref}>
        {children}
      </div>
    </div>
  );
}
import { LADDER, rungSpec } from '../engine/ladder';
import { BACKGROUNDS, bgUrl, CHARACTERS, spriteUrl } from '../content/characters';

// ---------------------------------------------------------------- stage

export function StageBackground({ bgId }: { bgId: string }) {
  const def = BACKGROUNDS[bgId] ?? BACKGROUNDS.office_gold;
  const [imgOk, setImgOk] = useState(true);
  return (
    <>
      {imgOk && <img src={bgUrl(def.file)} alt="" style={{ display: 'none' }} onError={() => setImgOk(false)} />}
      <div
        className="vn-bg"
        style={imgOk ? { backgroundImage: `url(${bgUrl(def.file)}), ${def.fallback}` } : { backgroundImage: def.fallback }}
      />
    </>
  );
}

// gradient palettes for placeholder silhouettes, keyed by character
const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  sana: 'linear-gradient(180deg, #cdb0e8 0%, #a584cc 55%, #71589a 100%)',
  devon: 'linear-gradient(180deg, #f6c490 0%, #e09a58 55%, #a86c38 100%)',
  jules: 'linear-gradient(180deg, #a9cdee 0%, #7fa8d0 55%, #54759c 100%)',
  mira: 'linear-gradient(180deg, #f0a9b6 0%, #d47a8c 55%, #9c4f60 100%)',
};

export function Sprite({
  speakerId,
  expression,
  flicker,
  dimmed,
}: {
  speakerId: string;
  expression: string;
  flicker: boolean;
  dimmed: boolean;
}) {
  const ch = CHARACTERS[speakerId];
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  if (!ch || !ch.spritePrefix) return null;

  const expr = ch.expressions.includes(expression) ? expression : ch.expressions[0];
  const url = spriteUrl(ch.spritePrefix, expr);
  const cls = `${flicker ? 'sprite-flicker' : ''} ${dimmed ? 'dimmed' : ''}`;

  if (!failed[url]) {
    return (
      <img
        key={`${speakerId}-${expr}`}
        className={`sprite ${cls}`}
        src={url}
        alt={`${ch.name} (${expr})`}
        onError={() => setFailed((f) => ({ ...f, [url]: true }))}
      />
    );
  }
  return (
    <div
      key={`${speakerId}-${expr}-ph`}
      className={`sprite-placeholder ${cls}`}
      style={{ background: PLACEHOLDER_GRADIENTS[speakerId] ?? PLACEHOLDER_GRADIENTS.sana }}
    >
      <div className="ph-initial">{ch.name[0]}</div>
      <div className="ph-name">{ch.name}</div>
      <div className="ph-expr">({expr})</div>
    </div>
  );
}

// ---------------------------------------------------------------- document inserts

export function Insert({ block, flagged }: { block: VignetteBlock; flagged?: boolean }) {
  const ribbon = flagged ? <span className="flag-ribbon">flagged for you</span> : null;
  switch (block.type) {
    case 'memo':
      return (
        <div className={`insert ${flagged ? 'flagged' : ''}`}>
          {ribbon}
          <div className="ins-head">
            memo · {block.from} · re: {block.subject}
          </div>
          <div className="ins-body">{block.text}</div>
        </div>
      );
    case 'evalReport':
      return (
        <div className={`insert ${flagged ? 'flagged' : ''}`}>
          {ribbon}
          <div className="ins-head">{block.title}</div>
          <ul>
            {block.lines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      );
    case 'incidentReport':
      return (
        <div className={`insert sev-${block.severity} ${flagged ? 'flagged' : ''}`}>
          {ribbon}
          <div className="ins-head">⬢ {block.title}</div>
          <div className="ins-body">{block.text}</div>
        </div>
      );
    case 'slack':
      return (
        <div className={`insert ${flagged ? 'flagged' : ''}`}>
          {ribbon}
          <div className="ins-head">@{block.from}</div>
          <div className="ins-body">{block.text}</div>
        </div>
      );
    default:
      return null;
  }
}

// ------------------------------------------- Status panel (always on, read-only)

function Bar({ kind, value }: { kind: string; value: number }) {
  return (
    <div className={`bar bar-${kind}`}>
      <i style={{ width: `${value}%` }} />
    </div>
  );
}

function StatusMeter({ label, kind, value, denom }: { label: string; kind: string; value: number; denom?: boolean }) {
  return (
    <>
      <div className="hud-meter">
        <span className="hud-k">{label}</span>
        <span className="hud-v">
          {Math.round(value)}
          {denom && <span className="hud-denom">/100</span>}
        </span>
      </div>
      <Bar kind={kind} value={value} />
    </>
  );
}

/** The single, non-interactive status panel — every meter + the capability
 *  ladder, glanceable on the stage. pointer-events:none so clicks fall through
 *  to advance the dialogue; all real choices happen in the script. */
export function Hud({ state }: { state: GameState }) {
  const m = state.meters;
  return (
    <div className="hud">
      <div className="hud-card">
        <div className="hud-group">The race · first to RSI wins</div>
        <StatusMeter label="You (ECHO)" kind="progress" value={m.progress} denom />
        <StatusMeter label="Frontier — rival lab" kind="rival" value={m.rival} denom />

        <div className="hud-group hud-group-2">Inside the lab</div>
        <StatusMeter label="Board’s trust in you" kind="trust" value={m.trust} />
        <StatusMeter label="Safety team’s alarm" kind="alarm" value={m.alarm} />
        <StatusMeter label="Oversight of ECHO" kind="oversight" value={m.oversight} />
      </div>

      <div className="hud-card">
        <div className="hud-group">How capable ECHO is</div>
        <div className="rung-ladder">
          {LADDER.filter((r) => r.rung < 5).map((r) => (
            <div key={r.rung} className={`rung-step ${state.rung === r.rung ? 'current' : state.rung > r.rung ? 'done' : ''}`}>
              <span className="rname">{r.name}</span>
              <span className="rmult">{r.multiplierLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- debug

export function DebugPanel({ state }: { state: GameState }) {
  return (
    <div className="debug-panel">
      <b>DEBUG</b> seed={state.seed}
      <br />
      disposition: <b>{state.hidden.disposition}</b> · takeoff: {state.hidden.takeoffSpeed} · difficulty: {state.hidden.alignmentDifficulty}
      <br />
      tracks: exfil {state.hidden.tracks.exfiltration} · sab {state.hidden.tracks.sabotage} · bd {state.hidden.tracks.backdoors} · per{' '}
      {state.hidden.tracks.persuasion}
      <br />
      caution {state.hidden.caution} · SA {Math.round(state.hidden.sitAwareness)} · debt {state.hidden.inflationDebt}
      <br />
      route {state.route} · regime {state.regime} · evid {state.evidenceQuality} · mult {rungSpec(state.rung).multiplierLabel}
    </div>
  );
}
