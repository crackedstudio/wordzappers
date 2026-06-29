import { generateDailyPuzzle } from './ai';

export interface Puzzle {
  path:        string[];
  label:       string;
  isAI?:       boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// ── Puzzle bank ──────────────────────────────────────────────────────────────
// All paths manually verified: each step differs by exactly one letter.

const EASY_PUZZLES: Puzzle[] = [
  // 4-letter words
  { path: ['COLD', 'CORD', 'WORD', 'WARD', 'WARM'], label: 'Puzzle #1', difficulty: 'easy' },
  { path: ['LATE', 'FATE', 'FACE', 'RACE', 'RICE', 'RISE'], label: 'Puzzle #2', difficulty: 'easy' },
  { path: ['SHIP', 'CHIP', 'CHOP', 'SHOP', 'STOP', 'STEP'], label: 'Puzzle #3', difficulty: 'easy' },
  { path: ['FIRE', 'HIRE', 'WIRE', 'WISE', 'WIDE', 'RIDE'], label: 'Puzzle #4', difficulty: 'easy' },
  { path: ['HAND', 'BAND', 'BOND', 'FOND', 'FIND', 'FINE', 'PINE'], label: 'Puzzle #5', difficulty: 'easy' },
  { path: ['LOOK', 'BOOK', 'COOK', 'COOL', 'FOOL', 'FOAL', 'FOAM'], label: 'Puzzle #6', difficulty: 'easy' },
  { path: ['DARK', 'DARE', 'CARE', 'CORE', 'MORE', 'MOLE', 'HOLE'], label: 'Puzzle #7', difficulty: 'easy' },
];

const MEDIUM_PUZZLES: Puzzle[] = [
  // 5-letter words
  {
    path: ['BLOOD', 'BLOND', 'BLAND', 'BRAND', 'BRAID', 'BRAIN', 'TRAIN'],
    label: 'Puzzle #8', difficulty: 'medium',
  },
  {
    path: ['FLAME', 'BLAME', 'BLAZE', 'GLAZE', 'GRAZE', 'GRACE', 'TRACE'],
    label: 'Puzzle #9', difficulty: 'medium',
  },
  {
    path: ['STONE', 'ATONE', 'ALONE', 'CLONE', 'CLOSE', 'CHOSE', 'THOSE'],
    label: 'Puzzle #10', difficulty: 'medium',
  },
  {
    path: ['SWORD', 'SWORE', 'SCORE', 'SCARE', 'SHARE', 'SPARE'],
    label: 'Puzzle #11', difficulty: 'medium',
  },
  {
    path: ['NIGHT', 'LIGHT', 'MIGHT', 'RIGHT', 'SIGHT', 'TIGHT', 'EIGHT'],
    label: 'Puzzle #12', difficulty: 'medium',
  },
  {
    path: ['BREAK', 'BREAD', 'TREAD', 'TREAT', 'GREAT', 'GREET', 'GREED', 'BREED'],
    label: 'Puzzle #13', difficulty: 'medium',
  },
  {
    path: ['WATER', 'LATER', 'LASER', 'LAGER', 'LAYER', 'PAYER'],
    label: 'Puzzle #14', difficulty: 'medium',
  },
];

const HARD_PUZZLES: Puzzle[] = [
  // 6-letter words
  {
    path: ['SINGLE', 'MINGLE', 'TINGLE', 'JINGLE', 'JANGLE', 'MANGLE', 'TANGLE'],
    label: 'Puzzle #15', difficulty: 'hard',
  },
  {
    path: ['FLIGHT', 'SLIGHT', 'BLIGHT', 'BRIGHT', 'FRIGHT', 'WRIGHT'],
    label: 'Puzzle #16', difficulty: 'hard',
  },
  {
    path: ['GARDEN', 'HARDEN', 'WARDEN', 'WARREN', 'BARREN', 'BARREL'],
    label: 'Puzzle #17', difficulty: 'hard',
  },
  {
    path: ['WINTER', 'WINDER', 'BINDER', 'FINDER', 'FONDER', 'WONDER', 'WANDER'],
    label: 'Puzzle #18', difficulty: 'hard',
  },
  {
    path: ['FINGER', 'GINGER', 'LINGER', 'SINGER', 'SINNER', 'WINNER'],
    label: 'Puzzle #19', difficulty: 'hard',
  },
  {
    path: ['BORDER', 'BONDER', 'BOLDER', 'FOLDER', 'MOLDER', 'HOLDER', 'SOLDER'],
    label: 'Puzzle #20', difficulty: 'hard',
  },
  {
    path: ['LOCKET', 'ROCKET', 'ROCKED', 'LOCKED', 'LOCKER', 'DOCKER', 'DOCKET'],
    label: 'Puzzle #21', difficulty: 'hard',
  },
];

// Cycle pattern: easy → medium → hard → easy → …
// Day index maps to a difficulty bracket, then picks within that bracket.
const CYCLE = ['easy', 'easy', 'medium', 'hard'] as const;
type Diff = typeof CYCLE[number];

const POOL: Record<Diff, Puzzle[]> = {
  easy:   EASY_PUZZLES,
  medium: MEDIUM_PUZZLES,
  hard:   HARD_PUZZLES,
};

// ── Date helpers ─────────────────────────────────────────────────────────────

function getDayOfYear(): number {
  const now   = new Date();
  const start = new Date(now.getUTCFullYear(), 0, 0);
  const diff  = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function getTodayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatPuzzleDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Difficulty label for display
export const DIFFICULTY_LABELS: Record<string, string> = {
  easy:   '4-letter · Easy',
  medium: '5-letter · Medium',
  hard:   '6-letter · Hard',
};

// ── Active puzzle ────────────────────────────────────────────────────────────

let _todayPuzzle: Puzzle | null = null;

export function getTodayPuzzle(): Puzzle {
  if (_todayPuzzle) return _todayPuzzle;

  // Check for cached AI puzzle
  const dateStr  = getTodayDateStr();
  const cacheKey = `ai-puzzle-${dateStr}`;
  const cached   = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const p = JSON.parse(cached);
      if (Array.isArray(p.path) && p.path.length >= 3) {
        _todayPuzzle = { path: p.path, label: 'AI Puzzle', isAI: true, difficulty: 'hard' };
        return _todayPuzzle;
      }
    } catch { /* fall through */ }
  }

  const day   = getDayOfYear();
  const diff  = CYCLE[day % CYCLE.length];
  const pool  = POOL[diff];
  _todayPuzzle = pool[day % pool.length];
  return _todayPuzzle;
}

export async function prefetchAIPuzzle(): Promise<void> {
  const dateStr  = getTodayDateStr();
  const cacheKey = `ai-puzzle-${dateStr}`;
  if (localStorage.getItem(cacheKey)) return;

  try {
    const puzzle = await generateDailyPuzzle(dateStr);
    localStorage.setItem(cacheKey, JSON.stringify(puzzle));
    _todayPuzzle = null;
  } catch {
    // Silently fall back to static puzzle
  }
}
