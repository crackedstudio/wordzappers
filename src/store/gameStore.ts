import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getTodayPuzzle, getTodayDateStr } from '../lib/puzzles';
import { shuffleWord } from '../lib/tiles';
import { calculateScore, computeGEarned, updateStreak, getTimeLimit } from '../lib/scoring';
import type { Tile } from '../lib/tiles';

// ── Types ────────────────────────────────────────────────────────────────────

export type GameStatus = 'idle' | 'correct' | 'wrong';
export type RunResult  = 'win' | 'timeout';
export type ClaimState = 'idle' | 'connecting' | 'ready' | 'claimed';

export interface GameStore {
  // ── Run (non-persisted) ─────────────────────────────────────────────────
  builtPath:  string[];
  tray:       Tile[];
  slots:      (string | null)[];
  status:     GameStatus;
  timeLeft:   number;
  totalTime:  number;   // dynamic — set from puzzle word length on startRun
  running:    boolean;
  score:      number;
  runResult:  RunResult | null;

  // ── Tutorial ────────────────────────────────────────────────────────────
  tutStep:   number;           // 0 = watch, 1 = try
  tutTray:   Tile[];
  tutSlots:  (string | null)[];
  tutStatus: 'idle' | 'done';

  // ── Claim flow ──────────────────────────────────────────────────────────
  claimState: ClaimState;

  // ── Leaderboard tab ─────────────────────────────────────────────────────
  lbTab: 'today' | 'all';

  // ── Theme ───────────────────────────────────────────────────────────────
  dark: boolean;

  // ── Persisted player data ────────────────────────────────────────────────
  streak:         number;
  lastPlayedDate: string | null;
  bestToday:      number | null;
  todayDate:      string | null;
  unclaimed:      number;
  claimed:        boolean;
  walletAddress:  string | null;
  tutorialDone:   boolean;

  // ── Actions ─────────────────────────────────────────────────────────────
  hydrateDay:      () => void;
  startRun:        () => void;
  startTutorial:   () => void;
  placeTile:       (id: string) => void;
  removeSlot:      (idx: number) => void;
  confirmAnswer:   () => void;
  tickTimer:       () => void;
  triggerTimeout:  () => void;
  advanceRung:     () => void;
  resetWrongGuess: () => void;
  placeTutTile:    (id: string) => void;
  removeTutSlot:   (idx: number) => void;
  clearTutSlots:   () => void;
  nextTutStep:     () => void;
  setClaimState:   (s: ClaimState) => void;
  doClaim:         () => void;
  setWallet:       (addr: string) => void;
  disconnect:      () => void;
  setLbTab:        (tab: 'today' | 'all') => void;
  toggleDark:      () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function endRunState(
  get: () => GameStore,
  outcome: RunResult,
  finalBuiltPath: string[],
  finalScore: number,
): Partial<GameStore> {
  const today = getTodayDateStr();
  const { bestToday, streak, lastPlayedDate } = get();
  const newBest = bestToday == null ? finalScore : Math.max(bestToday, finalScore);
  const newStreak = updateStreak(streak, lastPlayedDate, today);
  return {
    builtPath:      finalBuiltPath,
    running:        false,
    runResult:      outcome,
    score:          finalScore,
    status:         'idle',
    bestToday:      newBest,
    todayDate:      today,
    unclaimed:      computeGEarned(newBest, newStreak),
    claimed:        false,
    streak:         newStreak,
    lastPlayedDate: today,
  };
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Run state
      builtPath:  [],
      tray:       [],
      slots:      [],
      status:     'idle',
      timeLeft:   60,
      totalTime:  60,
      running:    false,
      score:      0,
      runResult:  null,

      // Tutorial
      tutStep:   0,
      tutTray:   [],
      tutSlots:  [],
      tutStatus: 'idle',

      // UI
      claimState: 'idle',
      lbTab:      'today',
      dark:       false,

      // Persisted
      streak:         0,
      lastPlayedDate: null,
      bestToday:      null,
      todayDate:      null,
      unclaimed:      0,
      claimed:        false,
      walletAddress:  null,
      tutorialDone:   false,

      // ── Actions ─────────────────────────────────────────────────────────

      hydrateDay() {
        const today = getTodayDateStr();
        if (get().todayDate !== today) {
          set({ bestToday: null, unclaimed: 0, claimed: false, claimState: 'idle', todayDate: today });
        }
      },

      startRun() {
        const path      = getTodayPuzzle().path;
        const wordLen   = path[1].length;
        const totalTime = getTimeLimit(wordLen);
        const tray      = shuffleWord(path[1]);
        set({
          builtPath: [path[0]],
          tray,
          slots:     Array(wordLen).fill(null),
          status:    'idle',
          timeLeft:  totalTime,
          totalTime,
          running:   true,
          score:     0,
          runResult: null,
        });
      },

      startTutorial() {
        const tutTray = shuffleWord('WORD');
        set({
          tutStep:   0,
          tutTray,
          tutSlots:  Array(4).fill(null),
          tutStatus: 'idle',
        });
      },

      placeTile(id) {
        const { tray, slots, status } = get();
        if (status !== 'idle' || slots.includes(id)) return;
        const i = slots.indexOf(null);
        if (i < 0) return;
        const next = [...slots];
        next[i] = id;
        set({ slots: next });
      },

      removeSlot(idx) {
        const { slots, status } = get();
        if (status !== 'idle' || !slots[idx]) return;
        const next = [...slots];
        next[idx] = null;
        set({ slots: next });
      },

      confirmAnswer() {
        const { slots, tray, builtPath, status } = get();
        if (slots.includes(null) || status !== 'idle') return;
        const path = getTodayPuzzle().path;
        const word = slots.map(id => tray.find(t => t.id === id)!.letter).join('');
        const expected = path[builtPath.length];
        if (word === expected) {
          set({ status: 'correct' });
        } else {
          set(s => ({ status: 'wrong', timeLeft: Math.max(0, s.timeLeft - 3) }));
        }
      },

      tickTimer() {
        const { running, timeLeft } = get();
        if (!running) return;
        const next = Math.max(0, timeLeft - 0.1);
        if (next <= 0) {
          get().triggerTimeout();
        } else {
          set({ timeLeft: next });
        }
      },

      triggerTimeout() {
        const { builtPath } = get();
        const wordLen    = getTodayPuzzle().path[1]?.length ?? 4;
        const rungs      = builtPath.length - 1;
        const finalScore = calculateScore(rungs, 0, false, wordLen);
        set(endRunState(get, 'timeout', builtPath, finalScore));
      },

      advanceRung() {
        const { builtPath, timeLeft } = get();
        const path    = getTodayPuzzle().path;
        const wordLen = path[1]?.length ?? 4;
        const next    = [...builtPath, path[builtPath.length]];
        const runScore = next.length - 1;

        if (next.length >= path.length) {
          const finalScore = calculateScore(runScore, timeLeft, true, wordLen);
          set(endRunState(get, 'win', next, finalScore));
          return;
        }

        const nextWord = path[next.length];
        set({
          builtPath: next,
          tray:      shuffleWord(nextWord),
          slots:     Array(nextWord.length).fill(null),
          status:    'idle',
          score:     runScore * 200,
        });
      },

      resetWrongGuess() {
        set(s => ({ status: 'idle', slots: s.slots.map(() => null) }));
      },

      // ── Tutorial actions ─────────────────────────────────────────────────

      placeTutTile(id) {
        const { tutTray, tutSlots, tutStatus } = get();
        if (tutStatus === 'done' || tutSlots.includes(id)) return;
        const i = tutSlots.indexOf(null);
        if (i < 0) return;
        const next = [...tutSlots];
        next[i] = id;
        const word = next.map(tid => tid ? tutTray.find(t => t.id === tid)?.letter ?? '' : '').join('');
        const done = !next.includes(null) && word === 'WORD';
        set({ tutSlots: next, tutStatus: done ? 'done' : 'idle' });
      },

      removeTutSlot(idx) {
        const { tutSlots, tutStatus } = get();
        if (tutStatus === 'done' || !tutSlots[idx]) return;
        const next = [...tutSlots];
        next[idx] = null;
        set({ tutSlots: next });
      },

      clearTutSlots() {
        set(s => ({ tutSlots: Array(s.tutSlots.length).fill(null) }));
      },

      nextTutStep() {
        const { tutStep } = get();
        if (tutStep === 0) {
          set({ tutStep: 1 });
        } else {
          set({ tutorialDone: true });
          get().startRun();
        }
      },

      // ── Claim actions ────────────────────────────────────────────────────

      setClaimState(s) { set({ claimState: s }); },

      doClaim() {
        set({ claimed: true, unclaimed: 0, claimState: 'claimed' });
      },

      setWallet(addr) {
        set({ walletAddress: addr, claimState: 'ready' });
      },

      disconnect() {
        set({ walletAddress: null, claimState: 'idle', claimed: false });
      },

      // ── Misc ─────────────────────────────────────────────────────────────

      setLbTab(tab) { set({ lbTab: tab }); },

      toggleDark() { set(s => ({ dark: !s.dark })); },
    }),
    {
      name: 'wordzapper-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: s => ({
        streak:         s.streak,
        lastPlayedDate: s.lastPlayedDate,
        bestToday:      s.bestToday,
        todayDate:      s.todayDate,
        unclaimed:      s.unclaimed,
        claimed:        s.claimed,
        walletAddress:  s.walletAddress,
        tutorialDone:   s.tutorialDone,
        dark:           s.dark,
      }),
    }
  )
);
