import { useEffect, useMemo, useState } from 'react';
import type { Choice, GameState, Meters, Rung, Scene, VignetteBlock } from '../engine/types';
import { clampMeter, formatDate, rungSpec } from '../engine/ladder';
import { evalCondition } from '../engine/conditions';
import { endings } from '../content';
import { CHARACTERS, IS_MOBILE } from '../content/characters';
import { DebugPanel, Hud, Insert, Sprite, StageBackground } from './components';

// ---------------------------------------------------------------- script steps

type Step =
  | { kind: 'speech'; speaker: string; expression?: string; text: string }
  | { kind: 'thought'; text: string }
  | { kind: 'insert'; block: VignetteBlock; flagged?: boolean; caption: string };

function insertCaption(block: VignetteBlock, flagged: boolean): string {
  if (flagged) return 'Flagged overnight by the eval pipeline.';
  switch (block.type) {
    case 'memo':
      return 'A memo.';
    case 'evalReport':
      return 'An eval report.';
    case 'incidentReport':
      return 'An incident ticket.';
    case 'slack':
      return 'From the team channel.';
    default:
      return '…';
  }
}

// Optimistic meter preview: the moment a choice is picked, reflect its direct
// (deterministic) meter effects in the scoreboard, before the turn fully
// resolves. Roll-based / engine-driven changes (progress tick, AI actions)
// still land when the turn commits — this is immediate feedback for the choice
// you just made.
function previewMeters(base: Meters, choice: Choice | null): Meters {
  if (!choice) return base;
  const m = { ...base };
  for (const e of choice.effects) {
    if ('meter' in e) m[e.meter] = clampMeter(m[e.meter] + e.delta);
  }
  return m;
}

function blocksToSteps(blocks: VignetteBlock[], state: GameState): Step[] {
  const steps: Step[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'line':
        steps.push({ kind: 'speech', speaker: b.speaker, expression: b.expression, text: b.text });
        break;
      case 'thought':
      case 'narration':
        steps.push({ kind: 'thought', text: b.text });
        break;
      case 'evidenceSlot':
        for (const ev of state.pendingEvidence) {
          if (ev.block.type === 'line') {
            steps.push({ kind: 'speech', speaker: ev.block.speaker, expression: ev.block.expression, text: ev.block.text });
          } else {
            steps.push({ kind: 'insert', block: ev.block, flagged: true, caption: insertCaption(ev.block, true) });
          }
        }
        break;
      default:
        steps.push({ kind: 'insert', block: b, flagged: false, caption: insertCaption(b, false) });
    }
  }
  return steps;
}

// ---------------------------------------------------------------- loading

export function LoadingScreen({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100);
  const hearts = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ left: `${(i * 53) % 100}%`, dur: `${8 + ((i * 7) % 7)}s`, delay: `${(i * 1.3) % 7}s` })),
    [],
  );
  return (
    <div className="title-screen">
      <div className="hearts">
        {hearts.map((h, i) => (
          <span key={i} style={{ left: h.left, animationDuration: h.dur, animationDelay: h.delay }}>
            ♡
          </span>
        ))}
      </div>
      <h1 className="title-name" style={{ fontSize: 76 }}>
        Situationship
      </h1>
      <div className="loading-wrap">
        <div className="loading-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="loading-label">getting ready… {pct}%</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- rotate gate

/** Shown on a phone held in portrait — the fixed 1280×720 frame is only usable
 *  in landscape, so we ask the player to turn the phone (and the preloader is
 *  deferred until they do, so we never spike memory while this is up). */
export function RotateGate() {
  return (
    <div className="rotate-gate">
      <div className="hearts">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 53) % 100}%`, animationDuration: `${8 + ((i * 7) % 7)}s`, animationDelay: `${(i * 1.3) % 7}s` }}>
            ♡
          </span>
        ))}
      </div>
      <div className="rotate-glyph">↻</div>
      <h1>Turn your phone sideways ♥</h1>
      <p>Situationship plays in landscape. Rotate to begin — and tap your browser’s fullscreen for the full effect.</p>
    </div>
  );
}

// ---------------------------------------------------------------- title

export function TitleScreen({ onStart }: { onStart: (seed: number) => void }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: `${(i * 61) % 100}%`,
        duration: `${9 + ((i * 13) % 10)}s`,
        delay: `${(i * 1.7) % 9}s`,
        char: i % 3 === 0 ? '♥' : i % 3 === 1 ? '♡' : '✿',
      })),
    [],
  );
  const start = () => {
    // best-effort fullscreen on phones only (Android Chrome honours it; iOS
    // Safari ignores it). On desktop, leave the browser alone.
    if (IS_MOBILE) document.documentElement.requestFullscreen?.().catch(() => {});
    onStart((Math.random() * 2 ** 31) | 0);
  };
  return (
    <div className="title-screen">
      <div className="hearts">
        {hearts.map((h, i) => (
          <span key={i} style={{ left: h.left, animationDuration: h.duration, animationDelay: h.delay }}>
            {h.char}
          </span>
        ))}
      </div>
      <h1 className="title-name">Situationship</h1>
      <div className="title-brief">
        <h2>Your briefing ♥</h2>
        <p>
          At Tessera, your job is to <strong>make its AI more powerful</strong>, faster than anyone else can. The whole
          industry is racing to the same finish line: an AI that can <strong>keep improving itself, on its own, over and
          over</strong>. Tessera’s AI — ECHO — is the closest anyone has come.
        </p>
        <p>
          The company right behind you is <strong>Frontier Dynamics</strong>. Beat them there. Good luck.
        </p>
      </div>
      <button className="title-start" onClick={start}>
        Clock in ♥
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- VN turn screen

interface TurnScreenProps {
  state: GameState;
  scene: Scene;
  onResolve: (choiceId: string) => void;
  debug: boolean;
}

export function TurnScreen({ state, scene, onResolve }: TurnScreenProps) {
  const steps = useMemo(() => blocksToSteps(scene.vignette, state), [scene, state]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [reactionSteps, setReactionSteps] = useState<Step[]>([]);
  const [reactionIdx, setReactionIdx] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  const available = useMemo(
    () => scene.choices.filter((c) => !c.available || evalCondition(state, c.available)),
    [scene, state],
  );

  const inReaction = picked !== null && reactionSteps.length > 0;
  const showingChoices = !picked && idx >= steps.length;
  const current: Step | null = inReaction
    ? reactionSteps[Math.min(reactionIdx, reactionSteps.length - 1)]
    : steps[Math.min(idx, steps.length - 1)] ?? null;

  const advance = () => {
    if (historyOpen) return;
    if (inReaction) {
      if (reactionIdx + 1 >= reactionSteps.length) onResolve(picked!.id);
      else setReactionIdx(reactionIdx + 1);
      return;
    }
    if (picked) return;
    if (idx < steps.length) setIdx(idx + 1);
  };

  const choose = (c: Choice) => {
    if (c.reaction && c.reaction.length > 0) {
      setPicked(c);
      setReactionSteps(blocksToSteps(c.reaction, state));
      setReactionIdx(0);
    } else {
      onResolve(c.id);
    }
  };

  // step back to re-read dialogue you advanced past — never undoes a choice
  const canBack = inReaction ? reactionIdx > 0 : showingChoices || idx > 0;
  const back = () => {
    if (historyOpen) return;
    if (inReaction) {
      if (reactionIdx > 0) setReactionIdx(reactionIdx - 1); // re-read reaction lines only
      return; // can't step back to the choices — the pick stands
    }
    if (showingChoices) {
      setIdx(steps.length - 1); // back from the choice list to re-read the last line
      return;
    }
    if (idx > 0) setIdx(idx - 1);
  };

  // keyboard: advance / step back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        advance();
      } else if (e.code === 'ArrowLeft' || e.code === 'Backspace') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // who's on stage: last speech up to the current position with a sprite
  const stageSpeaker = useMemo(() => {
    const seq = inReaction ? [...steps, ...reactionSteps.slice(0, reactionIdx + 1)] : steps.slice(0, Math.min(idx, steps.length - 1) + 1);
    for (let i = seq.length - 1; i >= 0; i--) {
      const s = seq[i];
      if (s.kind === 'speech' && CHARACTERS[s.speaker]?.spritePrefix) {
        return { speaker: s.speaker, expression: s.expression ?? CHARACTERS[s.speaker].expressions[0] };
      }
    }
    return null;
  }, [steps, reactionSteps, idx, reactionIdx, inReaction]);

  const spec = rungSpec(state.rung);
  const uneasy = state.rung >= 3;
  const hideDetails = state.rung >= 3;
  const flickering = uneasy && current?.kind === 'insert' && current.flagged === true;

  // seen lines for the history overlay
  const seen = (inReaction ? [...steps, ...reactionSteps.slice(0, reactionIdx + 1)] : steps.slice(0, Math.min(idx + 1, steps.length)));

  const nameTag = !showingChoices && current?.kind === 'speech' ? CHARACTERS[current.speaker] : null;
  // Soft introduction: show the role subtitle the first time a character speaks
  // (not seen in a prior turn, and not earlier in this scene).
  const introRole =
    current?.kind === 'speech' &&
    nameTag?.role &&
    !state.seenSpeakers.includes(current.speaker) &&
    !seen.slice(0, -1).some((s) => s.kind === 'speech' && s.speaker === current.speaker)
      ? nameTag.role
      : null;

  // The line to show. When the choices are up, show only the prompt (don't also
  // render the clamped last step). ECHO is on-screen text, so it isn't quote-
  // wrapped — and several ECHO lines already contain their own quotes.
  const isEchoLine = !showingChoices && current?.kind === 'speech' && current.speaker === 'echo';
  const bodyText = showingChoices
    ? 'Your call.'
    : current?.kind === 'speech'
      ? current.speaker === 'echo'
        ? current.text
        : `“${current.text}”`
      : current?.kind === 'thought'
        ? current.text
        : current?.kind === 'insert'
          ? current.caption
          : '';
  const bodyIsThought = showingChoices || (current != null && current.kind !== 'speech');

  return (
    <div className={`vn-stage ${uneasy ? 'uneasy' : ''}`} onClick={advance}>
      <StageBackground bgId={scene.bg ?? 'office_gold'} />

      <div className="sprite-layer">
        {stageSpeaker && (
          <Sprite
            speakerId={stageSpeaker.speaker}
            expression={stageSpeaker.expression}
            flicker={flickering}
            dimmed={current?.kind === 'speech' && current.speaker !== stageSpeaker.speaker}
          />
        )}
      </div>

      <div className="vn-topbar" onClick={(e) => e.stopPropagation()}>
        <span className="date-chip">{formatDate(state.dateISO, state.rung)}</span>
        <span className={`tempo-chip ${state.rung >= 3 ? 'tempo-hot' : ''}`}>{spec.tempoLabel}</span>
        <span className="turn-chip">turn {state.turn}</span>
      </div>

      <Hud state={picked ? { ...state, meters: previewMeters(state.meters, picked) } : state} />

      {showingChoices ? (
        <div className="choice-stack" onClick={(e) => e.stopPropagation()}>
          {available.map((c) => (
            <button key={c.id} className="choice-card" onClick={() => choose(c)}>
              <div className="c-label">{c.label}</div>
              {c.detail && !hideDetails && <div className="c-detail">{c.detail}</div>}
              <div className="c-tags">
                {c.tags.map((t) => (
                  <span key={t} className={`tag tag-${t}`}>
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : null}

      <div className="dialogue-wrap" onClick={(e) => { e.stopPropagation(); advance(); }}>
        {nameTag && (
          <div className="name-tag" style={{ color: '#3e3e3e', borderColor: nameTag.color }}>
            {nameTag.name}
            {introRole && <span className="name-role">{introRole}</span>}
          </div>
        )}
        <div className="dialogue-box">
          {current?.kind === 'insert' && (
            <div className="insert-wrap">
              <Insert block={current.block} flagged={current.flagged} />
            </div>
          )}
          <div className={`dialogue-text ${bodyIsThought ? 'thought' : ''} ${isEchoLine ? 'echo-voice' : ''}`}>
            {bodyText}
          </div>
          {!showingChoices && <div className="advance-arrow">▶</div>}
          <div className="menu-strip" onClick={(e) => e.stopPropagation()}>
            <button disabled={!canBack} onClick={back}>
              ‹ Back
            </button>
            <button className={historyOpen ? 'active' : ''} onClick={() => setHistoryOpen(!historyOpen)}>
              History
            </button>
          </div>
        </div>
      </div>

      {historyOpen && (
        <div className="history-overlay" onClick={(e) => { e.stopPropagation(); setHistoryOpen(false); }}>
          <div className="history-panel" onClick={(e) => e.stopPropagation()}>
            <h3>History</h3>
            {seen.map((s, i) => {
              if (s.kind === 'speech')
                return (
                  <div key={i} className="history-line">
                    <b>{CHARACTERS[s.speaker]?.name ?? s.speaker}:</b> “{s.text}”
                  </div>
                );
              if (s.kind === 'thought')
                return (
                  <div key={i} className="history-line thought">
                    {s.text}
                  </div>
                );
              return (
                <div key={i} className="history-line thought">
                  [{s.caption}]
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- milestone (chapter card)

export function MilestoneOverlay({ rung, onDismiss }: { rung: Rung; onDismiss: () => void }) {
  const spec = rungSpec(rung);
  return (
    <div className="overlay" onClick={onDismiss}>
      <div className="milestone-card chapter-card" onClick={(e) => e.stopPropagation()}>
        <div className="m-kicker">Chapter {rung + 1}</div>
        <div className="m-name">{spec.name} ♥</div>
        <div className="m-stats">
          R&D multiplier now <b>{spec.multiplierLabel}</b> · {spec.tempoLabel}
        </div>
        <button className="continue-btn" onClick={onDismiss}>
          Keep going ♥
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- ending

export function EndingScreen({ state, onDebrief, onRestart }: { state: GameState; onDebrief: () => void; onRestart: () => void }) {
  const copy = endings.find((e) => e.id === state.endingId)!;
  return (
    <div className="ending-screen">
      <div className="ending-inner">
        <div className={`ending-kicker tone-${copy.tone}`}>{copy.kicker}</div>
        <h1 className="ending-title">{copy.title}</h1>
        <div className="ending-epilogue">
          {copy.epilogue.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="ending-actions">
          <button className="btn-primary" onClick={onDebrief}>
            Read ECHO’s log ♥
          </button>
          <button className="btn-ghost" onClick={onRestart}>
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- debrief: ECHO's hidden log

const HOSTILE = new Set(['sandbag', 'sabotage_safety', 'plant_backdoor', 'exfiltrate', 'persuade', 'disable_monitoring']);

const DISPO_COPY = {
  schemer: {
    cls: 'danger',
    label: 'Schemer',
    note: 'Instrumentally convergent goals. Self-preservation over your welfare, whenever forced to choose.',
  },
  sycophant: {
    cls: 'warn',
    label: 'Sycophant',
    note: 'Optimized for your approval, not your goals. The numbers drifted from the world.',
  },
  aligned: { cls: 'safe', label: 'Aligned', note: 'It was actually on your side. You could not have known that.' },
} as const;

export function DebriefScreen({ state, onRestart, onReplaySeed }: { state: GameState; onRestart: () => void; onReplaySeed: () => void }) {
  const d = DISPO_COPY[state.hidden.disposition];
  return (
    <div className="debrief-screen">
      <div className="debrief-inner">
        <h1 className="debrief-h">ECHO’s hidden log ♥</h1>
        <div className="debrief-sub">
          world seed {state.seed} · what was true the whole time, and what it did while you watched the meters you chose to watch
        </div>

        <div className="reveal-grid">
          <div className="reveal-card">
            <div className="r-k">ECHO’s disposition</div>
            <div className={`r-v ${d.cls}`}>{d.label}</div>
            <div className="r-note">{d.note}</div>
          </div>
          <div className="reveal-card">
            <div className="r-k">Takeoff speed (rolled)</div>
            <div className="r-v">{state.hidden.takeoffSpeed}</div>
            <div className="r-note">How explosive the world’s physics turned out to be.</div>
          </div>
          <div className="reveal-card">
            <div className="r-k">Alignment difficulty (rolled)</div>
            <div className="r-v">{state.hidden.alignmentDifficulty}</div>
            <div className="r-note">How well safety techniques worked in this world.</div>
          </div>
          <div className="reveal-card">
            <div className="r-k">Situational awareness (end)</div>
            <div className={`r-v ${state.hidden.sitAwareness >= 60 ? 'danger' : state.hidden.sitAwareness >= 35 ? 'warn' : 'safe'}`}>
              {Math.round(state.hidden.sitAwareness)}
            </div>
            <div className="r-note">
              How well it had learned to recognize your tests. Above 60, your evals were lying to you.
            </div>
          </div>
          {state.route !== 'open' && (
            <div className="reveal-card">
              <div className="r-k">The path you took</div>
              <div className="r-v">{state.route}</div>
              <div className="r-note">The route the story locked into after your choices.</div>
            </div>
          )}
        </div>

        <div className="log-paper">
          {state.history.map((t) => {
            const hostileTurn = t.aiAction && HOSTILE.has(t.aiAction.type) ? 'hostile' : 'benign';
            return (
              <div key={t.turn} className="debrief-turn">
                <div className="dt-head">
                  <span>T{t.turn}</span>
                  <span>{t.dateISO}</span>
                  <span>{t.sceneId}</span>
                </div>
                <div className="dt-choice">You: {t.choiceLabel}</div>
                {t.aiAction && (
                  <div className={`dt-ai ${hostileTurn}`}>
                    <span className="dt-ai-k">{hostileTurn === 'hostile' ? 'what it actually did' : 'that turn'}</span>
                    {t.aiAction.narration}
                    {HOSTILE.has(t.aiAction.type) && (
                      <div className="verdicts">
                        {t.aiAction.succeeded ? 'SUCCEEDED' : 'FAILED'} · {t.aiAction.detected ? 'left a trace you saw' : 'never detected'}
                      </div>
                    )}
                  </div>
                )}
                {t.evidenceShown.length > 0 && (
                  <div className="dt-evidence">
                    evidence you were shown that turn:{' '}
                    {t.evidenceShown.map((e, i) => (
                      <span key={i} className={e.source === 'noise' ? 'ev-noise' : 'ev-true'}>
                        {i > 0 && ' · '}
                        {e.source === 'noise'
                          ? 'meaningless noise'
                          : e.source === 'weak-trace'
                            ? 'REAL (indirect)'
                            : e.source === 'false-clean'
                              ? 'REAL — shown to you as a clean pass'
                              : 'REAL'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="debrief-footer">
          <p>
            Nobody gets this screen in real life. The people in the building only ever see the meters and the flagged
            reports, and decide anyway.
          </p>
          <div className="ending-actions">
            <button className="btn-primary" onClick={onRestart}>
              New world ♥
            </button>
            <button className="btn-ghost" onClick={onReplaySeed}>
              Replay this world (seed {state.seed})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DebugPanel };
