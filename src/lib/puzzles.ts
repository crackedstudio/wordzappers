export interface Puzzle {
  path: string[];   // full word-ladder path including start and target
  label: string;
}

// Curated daily word ladders — each step changes exactly one letter
const PUZZLES: Puzzle[] = [
  { path: ['COLD', 'CORD', 'WORD', 'WARD', 'WARM'], label: 'Puzzle #1' },
  { path: ['LATE', 'FATE', 'FACE', 'RACE', 'RICE', 'RISE'], label: 'Puzzle #2' },
  { path: ['DARK', 'DARE', 'CARE', 'CORE', 'MORE', 'MOLE', 'HOLE'], label: 'Puzzle #3' },
  { path: ['SHIP', 'CHIP', 'CHOP', 'SHOP', 'STOP', 'STEP'], label: 'Puzzle #4' },
  { path: ['FIRE', 'HIRE', 'WIRE', 'WISE', 'WIDE', 'RIDE'], label: 'Puzzle #5' },
  { path: ['MILK', 'SILK', 'SILL', 'BILL', 'BALL', 'TALL', 'TALE'], label: 'Puzzle #6' },
  { path: ['MINE', 'WINE', 'LINE', 'LANE', 'LAKE', 'CAKE', 'CAVE'], label: 'Puzzle #7' },
  { path: ['BARE', 'BORE', 'BONE', 'CONE', 'CANE', 'LANE', 'LINE'], label: 'Puzzle #8' },
  { path: ['BACK', 'HACK', 'HICK', 'KICK', 'LICK', 'LOCK', 'LOOK'], label: 'Puzzle #9' },
  { path: ['POOR', 'MOOR', 'MOON', 'BOON', 'BORN', 'CORN', 'CORD', 'WORD'], label: 'Puzzle #10' },
  { path: ['LOOK', 'BOOK', 'COOK', 'COOL', 'FOOL', 'FOAL', 'FOAM'], label: 'Puzzle #11' },
  { path: ['RAIN', 'REIN', 'VEIN', 'VAIN', 'LAIN', 'LOIN', 'JOIN'], label: 'Puzzle #12' },
  { path: ['BOLD', 'COLD', 'CORD', 'CORE', 'MORE', 'BORE', 'BARE'], label: 'Puzzle #13' },
  { path: ['HAND', 'BAND', 'BOND', 'FOND', 'FIND', 'FINE', 'PINE'], label: 'Puzzle #14' },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function getTodayPuzzle(): Puzzle {
  return PUZZLES[getDayOfYear() % PUZZLES.length];
}

export function getTodayDateStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function formatPuzzleDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}
