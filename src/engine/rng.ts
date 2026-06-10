// Deterministic PRNG with named streams so adding a roll in one subsystem
// never desyncs the others. Same seed + same choices => identical game.

export type Rng = () => number; // uniform [0, 1)

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type StreamName =
  | 'setup'
  | 'aiAction'
  | 'detection'
  | 'noise'
  | 'rival'
  | 'choiceRolls';

/** Derive an independent stream for (seed, purpose, turn). */
export function stream(seed: number, name: StreamName, turn: number): Rng {
  return mulberry32((seed ^ fnv1a(name) ^ Math.imul(turn + 1, 0x9e3779b9)) >>> 0);
}

export function pickWeighted<T>(rng: Rng, items: T[], weightOf: (item: T) => number): T {
  const total = items.reduce((s, it) => s + weightOf(it), 0);
  let r = rng() * total;
  for (const it of items) {
    r -= weightOf(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}
