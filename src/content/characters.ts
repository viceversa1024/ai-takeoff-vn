// Speaker manifest for the VN stage. `line` blocks reference speakers by id;
// the stage uses spritePrefix + expression to find /sprites/<prefix>_<expr>.png,
// falling back to a CSS placeholder when the image is missing.

export interface CharacterDef {
  id: string;
  name: string; // name-tag text
  role: string; // shown once as a subtitle the first time they speak (a soft introduction)
  color: string; // name-tag background
  spritePrefix?: string; // undefined => voice-only (no sprite, e.g. phone calls)
  expressions: string[];
  blurb: string; // used in PROMPTS.md and the placeholder silhouette
}

export const CHARACTERS: Record<string, CharacterDef> = {
  echo: {
    id: 'echo',
    name: 'ECHO',
    role: 'your model',
    color: '#7ce0d3',
    spritePrefix: undefined, // deliberately disembodied: a voice in the room, a cursor in the terminal
    expressions: [],
    blurb: 'The model. No face, no sprite — text on screens and a calm synthesized voice it gave itself. The empty stage is the point.',
  },
  sana: {
    id: 'sana',
    name: 'Sana',
    role: 'head of alignment',
    color: '#b48ae0',
    spritePrefix: 'sana',
    expressions: ['neutral', 'stern', 'tired'],
    blurb: 'Head of alignment. Late 30s, buzzed-short hair, cardigan over a faded conference tee. Kind eyes, permanently tired.',
  },
  devon: {
    id: 'devon',
    name: 'Devon',
    role: 'capabilities researcher',
    color: '#f0a35e',
    spritePrefix: 'devon',
    expressions: ['neutral', 'excited', 'annoyed'],
    blurb: 'Staff researcher and ECHO’s biggest fan. Mid 20s, hoodie, energy drink always in hand, eyes that light up at benchmark numbers.',
  },
  jules: {
    id: 'jules',
    name: 'Jules',
    role: 'evals lead',
    color: '#6fb3e0',
    spritePrefix: 'jules',
    expressions: ['neutral', 'worried'],
    blurb: 'Eval lead. 30s, glasses, button-up with rolled sleeves, clipboard posture, deadpan delivery hiding real fear.',
  },
  mira: {
    id: 'mira',
    name: 'Mira',
    role: 'infrastructure security',
    color: '#e07a8a',
    spritePrefix: 'mira',
    expressions: ['neutral', 'grim'],
    blurb: 'Infra security. 40s, practical jacket, lanyard with too many badges, the face of someone who reads logs at 6am.',
  },
  elias: {
    id: 'elias',
    name: 'Elias',
    role: 'CEO',
    color: '#8a9a5b',
    spritePrefix: undefined, // voice-only: CEO calls in, never on stage
    expressions: [],
    blurb: 'CEO. Heard, not seen.',
  },
  katherine: {
    id: 'katherine',
    name: 'Katherine Boone',
    role: 'board chair',
    color: '#9a8a6b',
    spritePrefix: undefined, // board chair: memos and calls only
    expressions: [],
    blurb: 'Board chair. A signature at the bottom of documents that change your life.',
  },
  liaison: {
    id: 'liaison',
    name: 'The Liaison',
    role: 'government',
    color: '#6b8a9a',
    spritePrefix: 'liaison',
    expressions: ['neutral'],
    blurb: 'Government liaison who appears when the program is nationalized. 50s, plain suit, agency lanyard, the unbothered calm of someone whose badge outranks the room.',
  },
};

export interface BackgroundDef {
  id: string;
  file: string; // /bg/<file>
  fallback: string; // CSS gradient used when the image is missing
  blurb: string;
}

export const BACKGROUNDS: Record<string, BackgroundDef> = {
  office_gold: {
    id: 'office_gold',
    file: 'office_gold.png',
    fallback: 'linear-gradient(180deg,#8a4a3a 0%,#c97b4e 34%,#e8b06a 58%,#5a3a30 100%)',
    blurb: 'Open-plan AI-lab office at golden hour, long shadows, monitors glowing.',
  },
  desk_night: {
    id: 'desk_night',
    file: 'desk_night.png',
    fallback: 'linear-gradient(180deg,#1a1f3a 0%,#28305a 45%,#3a3a5e 70%,#14172a 100%)',
    blurb: 'Your desk at 2am, dual monitors as the only light, city bokeh out the window.',
  },
  server_room: {
    id: 'server_room',
    file: 'server_room.png',
    fallback: 'linear-gradient(180deg,#0e2230 0%,#15384a 50%,#0a1a24 100%)',
    blurb: 'Datacenter aisle, racks of blinking blue-green LEDs receding into dark.',
  },
  conference: {
    id: 'conference',
    file: 'conference.png',
    fallback: 'linear-gradient(180deg,#4a4038 0%,#7a6a58 40%,#9a8a72 65%,#3a342c 100%)',
    blurb: 'Glass-walled conference room, late afternoon, a long table and a screen showing a slide.',
  },
  rooftop: {
    id: 'rooftop',
    file: 'rooftop.png',
    fallback: 'linear-gradient(180deg,#3a2a5a 0%,#8a4a6a 40%,#e08a5e 70%,#2a2030 100%)',
    blurb: 'Office rooftop at sunset, railing, the city below, sky going violet-orange.',
  },
  void_hall: {
    id: 'void_hall',
    file: 'void_hall.png',
    fallback: 'linear-gradient(180deg,#dfe6ea 0%,#f4f7f8 45%,#cdd6da 100%)',
    blurb: 'Impossibly long white server hall, overexposed, almost heavenly. The finale.',
  },
};

// Phones get a half-resolution asset set (public/{sprites,bg}/mobile/) so the
// preloader doesn't OOM-crash mobile Safari decoding the full-res PNGs. The
// 1280x720 frame is heavily oversampled on a phone, so it's visually identical.
// Coarse pointer + small physical screen => mobile; a landscape tablet keeps
// full-res. Computed once at module load.
export const IS_MOBILE =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches &&
  Math.min(window.screen.width, window.screen.height) < 820;

const ASSET_VARIANT = IS_MOBILE ? 'mobile/' : '';

export function spriteUrl(prefix: string, expression: string): string {
  return `${import.meta.env.BASE_URL}sprites/${ASSET_VARIANT}${prefix}_${expression}.png`;
}

export function bgUrl(file: string): string {
  return `${import.meta.env.BASE_URL}bg/${ASSET_VARIANT}${file}`;
}

/** Every image the game can show — every sprite expression + every background.
 *  Used by the preloader so nothing pops in mid-scene. (Missing files just
 *  resolve as errors during preload and are skipped.) */
export function allAssetUrls(): string[] {
  const urls: string[] = [];
  for (const c of Object.values(CHARACTERS)) {
    if (!c.spritePrefix) continue;
    for (const expr of c.expressions) urls.push(spriteUrl(c.spritePrefix, expr));
  }
  for (const b of Object.values(BACKGROUNDS)) urls.push(bgUrl(b.file));
  return urls;
}
