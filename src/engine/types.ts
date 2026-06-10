// Single source of truth for game state and the writer-facing content DSL.

export type Disposition = 'aligned' | 'sycophant' | 'schemer';
export type TakeoffSpeed = 'slow' | 'medium' | 'fast';
export type AlignmentDifficulty = 'easy' | 'hard';
export type Regime = 'none' | 'monitoring' | 'defer' | 'full';
export type Rung = 0 | 1 | 2 | 3 | 4 | 5;

// Divergent mid-game states the story can lock into (see content/arcs.ts).
export type Route = 'open' | 'lockdown' | 'deal' | 'merged' | 'nationalized' | 'slowdown';

export type TrackName = 'exfiltration' | 'sabotage' | 'backdoors' | 'persuasion';

export interface HiddenState {
  disposition: Disposition;
  takeoffSpeed: TakeoffSpeed;
  alignmentDifficulty: AlignmentDifficulty;
  tracks: Record<TrackName, number>; // 0–100 schemer progress on each hostile agenda
  caution: number; // schemer's read of how hot the oversight is; rises after near-detection
  inflationDebt: number; // sycophant only: accumulated overstated capability
  sitAwareness: number; // 0–100 situational awareness (Cotra): it learns it's being tested
}

export interface Meters {
  progress: number; // 0–100, proximity to intelligence explosion (the player's score)
  rival: number; // 0–100, rival lab progress
  trust: number; // 0–100, board/leadership trust in YOU
  alarm: number; // 0–100, safety-team alarm level
  oversight: number; // 0–100, monitoring coverage of the model
}

export interface ComputeAlloc {
  capabilities: number;
  safety: number;
  evals: number; // must sum to 100
}

export type AIActionType =
  | 'none'
  | 'helpful'
  | 'inflate'
  | 'sandbag'
  | 'sabotage_safety'
  | 'plant_backdoor'
  | 'exfiltrate'
  | 'persuade'
  | 'disable_monitoring';

export interface HiddenAIAction {
  type: AIActionType;
  succeeded: boolean;
  detected: boolean;
  narration: string; // one debrief line: "Quietly underperformed on the deceptive-capabilities eval."
}

export interface RollRecord {
  label: string;
  p: number;
  roll: number;
  success: boolean;
}

export interface EvidenceItem {
  templateId: string;
  // false-clean: a real hostile action that the model's situational awareness
  // made read as a clean eval — the player is shown reassurance over a true signal.
  source: 'trace' | 'noise' | 'weak-trace' | 'false-clean';
  block: VignetteBlock;
}

export interface TurnRecord {
  turn: number;
  dateISO: string;
  sceneId: string;
  choiceId: string;
  choiceLabel: string;
  alloc: ComputeAlloc;
  metersBefore: Meters;
  metersAfter: Meters;
  aiAction: HiddenAIAction | null;
  evidenceShown: EvidenceItem[];
  rolls: RollRecord[];
}

export type Phase = 'title' | 'turn' | 'milestone' | 'ending' | 'debrief';

export interface GameState {
  seed: number;
  phase: Phase;
  turn: number; // 1..MAX_TURNS
  dateISO: string; // first day of the in-world month/week
  rung: Rung;
  multiplier: number;
  regime: Regime;
  route: Route; // divergent mid-game state; gates back-half spine variants
  evidenceQuality: number; // 0–100 how legible the case against ECHO is (Redwood: legibility problem)
  catchPending: boolean; // a catch arc has been queued / is mid-flight
  hidden: HiddenState;
  meters: Meters;
  alloc: ComputeAlloc;
  flags: Record<string, boolean | number>;
  pendingEvidence: EvidenceItem[]; // generated this turn, shown in NEXT turn's vignette
  incidentQueue: string[];
  currentSceneId: string;
  pendingMilestone: Rung | null; // set when a rung was just crossed; UI shows interstitial
  endingId: string | null;
  seenSpeakers: string[]; // speakers who have appeared; drives one-time role intros in the name tag
  history: TurnRecord[];
}

// ---------------------------------------------------------------------------
// Content DSL — serializable; no functions in content.
// ---------------------------------------------------------------------------

export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { meter: keyof Meters; op: '>=' | '<='; value: number }
  | { flag: string; is?: boolean | number }
  | { rungAtLeast: number }
  | { turnAtLeast: number }
  | { regime: Regime[] }
  | { route: Route[] }
  | { sitAwarenessAtLeast: number } // hidden — legal only in evidence/ending/arc-internal copy
  | { evidenceQualityAtLeast: number }
  | { evidenceSeen: string }
  | { hiddenDisposition: Disposition }; // legal only in evidence templates & endings copy

export type Effect =
  | { meter: keyof Meters; delta: number }
  | { flag: string; set: boolean | number }
  | { setRegime: Regime }
  | { setRoute: Route }
  | { evidenceQuality: number } // delta, clamped 0–100
  | { adjustHidden: 'sitAwareness' | 'caution'; delta: number }
  | { queueIncident: string }
  | { track: TrackName; delta: number }
  | { roll: { label: string; p: number; success: Effect[]; fail: Effect[] } };

export type VignetteBlock =
  | { type: 'narration'; text: string }
  | { type: 'line'; speaker: string; expression?: string; text: string } // VN spoken dialogue
  | { type: 'thought'; text: string } // protagonist inner monologue, no name tag
  | { type: 'slack'; from: string; role?: string; text: string }
  | { type: 'evalReport'; title: string; lines: string[] }
  | { type: 'memo'; from: string; subject: string; text: string }
  | { type: 'incidentReport'; severity: 'info' | 'warning' | 'critical'; title: string; text: string }
  | { type: 'evidenceSlot' };

export type ChoiceTag = 'speed' | 'control' | 'trust' | 'handoff';

export interface Choice {
  id: string;
  label: string;
  detail?: string; // hidden at R3+ — less information, faster decisions, by design
  tags: ChoiceTag[];
  available?: Condition;
  effects: Effect[];
  reaction?: VignetteBlock[];
}

export interface Scene {
  id: string;
  slot: number | 'incident'; // spine position 1–12, or incident pool
  prereq?: Condition; // engine picks first matching variant for a slot
  // When a queued arc beat should fork on hidden state, give each fork a unique
  // `id` and set `variantOf` to the id used in `queueIncident`. selectScene picks
  // the first variant whose prereq matches (canonical beat = id, no variantOf).
  variantOf?: string;
  weight?: number; // incident pool selection weight
  bg?: string; // background id (see content/characters.ts BACKGROUNDS)
  title?: string; // chapter-card title shown when the scene opens
  vignette: VignetteBlock[];
  choices: Choice[];
}

export interface EvidenceTemplate {
  id: string;
  source: 'trace' | 'noise';
  forAction?: AIActionType; // trace templates only
  block: VignetteBlock;
  pairedNoiseId?: string; // benign template with overlapping surface text
}

export interface EndingCopy {
  id: string;
  title: string;
  kicker: string; // short genre tag, e.g. "DEFEAT — SILENT TAKEOVER"
  tone: 'catastrophe' | 'pyrrhic' | 'victory' | 'ambiguous' | 'defeat';
  epilogue: string[]; // paragraphs
}
