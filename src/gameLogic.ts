import type { TileDatum } from './types';

export const LADDER = ['COLD', 'CORD', 'WORD', 'WARD', 'WARM'];
export const TOTAL_TIME = 60;
export const ACCENT = '#d97706';
export const START_STREAK = 5;

export const VALS: Record<string, number> = {
  A: 1, E: 1, I: 1, O: 1, U: 1, L: 1, N: 1, S: 1, T: 1, R: 1,
  D: 2, G: 2, B: 3, C: 3, M: 3, P: 3,
  F: 4, H: 4, V: 4, W: 4, Y: 4,
  K: 5, J: 8, X: 8, Q: 10, Z: 10,
};

export function tileVal(letter: string): number {
  return VALS[letter] ?? 1;
}

export function makeTray(word: string): { tray: TileDatum[]; slots: (string | null)[] } {
  const letters: TileDatum[] = word.split('').map((l, i) => ({
    id: `${word}_${i}_${Math.random().toString(36).slice(2, 6)}`,
    letter: l,
  }));

  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  // ensure the tray is never already in the correct order
  if (letters.map(t => t.letter).join('') === word && word.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }

  return { tray: letters, slots: Array(word.length).fill(null) };
}

export function computeGEarned(score: number): number {
  if (score >= 800) return 0.20;
  if (score >= 500) return 0.12;
  return 0.05;
}

export const TODAY_ROWS = [
  { r: 1, n: 'okaforjoy', s: 1240 },
  { r: 2, n: 'minty_g',   s: 1090 },
  { r: 3, n: 'dotun.eth', s: 980 },
  { r: 4, n: 'You',       s: 900,  me: true },
  { r: 5, n: 'amaka_w',   s: 760 },
  { r: 6, n: 'kojo_42',   s: 690 },
  { r: 7, n: 'sunny_d',   s: 610 },
  { r: 8, n: '0x7f…a2',  s: 540 },
];

export const ALL_ROWS = [
  { r: 1, n: 'minty_g',   s: 18420 },
  { r: 2, n: 'okaforjoy', s: 17110 },
  { r: 3, n: 'thelma.k',  s: 15980 },
  { r: 4, n: 'dotun.eth', s: 14200 },
  { r: 5, n: 'kojo_42',   s: 12640 },
  { r: 6, n: 'You',       s: 11890, me: true },
  { r: 7, n: 'amaka_w',   s: 9700 },
  { r: 8, n: 'sunny_d',   s: 8330 },
];
