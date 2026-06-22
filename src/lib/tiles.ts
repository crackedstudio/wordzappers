export interface Tile {
  id: string;
  letter: string;
}

export const TILE_VALUES: Record<string, number> = {
  A: 1, E: 1, I: 1, O: 1, U: 1, L: 1, N: 1, S: 1, T: 1, R: 1,
  D: 2, G: 2, B: 3, C: 3, M: 3, P: 3,
  F: 4, H: 4, V: 4, W: 4, Y: 4,
  K: 5, J: 8, X: 8, Q: 10, Z: 10,
};

export function tileValue(letter: string): number {
  return TILE_VALUES[letter.toUpperCase()] ?? 1;
}

export function shuffleWord(word: string): Tile[] {
  const tiles: Tile[] = word.toUpperCase().split('').map((l, i) => ({
    id: `${word}_${i}_${Math.random().toString(36).slice(2, 6)}`,
    letter: l,
  }));

  // Fisher-Yates
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Guarantee not already in order
  if (tiles.length > 1 && tiles.map(t => t.letter).join('') === word.toUpperCase()) {
    [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  }

  return tiles;
}
