import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AppState, Screen } from './types';
import { getPalette } from './theme';
import {
  LADDER, TOTAL_TIME, ACCENT, START_STREAK,
  makeTray, computeGEarned,
  TODAY_ROWS, ALL_ROWS,
} from './gameLogic';
import HomeScreen from './screens/HomeScreen';
import TutorialWatchScreen from './screens/TutorialWatchScreen';
import TutorialTryScreen from './screens/TutorialTryScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import ClaimScreen from './screens/ClaimScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

const SCREENS: Screen[] = ['home', 'tutorialWatch', 'tutorialTry', 'game', 'result', 'claim', 'leaderboard'];

const NAV_LABELS: Record<Screen, string> = {
  home: 'Home',
  tutorialWatch: 'Tutorial · Watch',
  tutorialTry: 'Tutorial · Try',
  game: 'Game · Play',
  result: 'Result',
  claim: 'Claim · Wallet',
  leaderboard: 'Leaderboard',
};

function initialState(): AppState {
  return {
    screen: 'home',
    dark: false,
    streak: START_STREAK,
    bestToday: null,
    unclaimed: 0,
    builtPath: [LADDER[0]],
    tray: [],
    slots: [],
    status: 'idle',
    timeLeft: TOTAL_TIME,
    running: false,
    score: 0,
    result: null,
    tutTray: [],
    tutSlots: [],
    tutStatus: 'idle',
    claimState: 'disconnected',
    claimed: false,
    lbTab: 'today',
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer — fires every 100ms while in game screen
  const startTimer = useCallback(() => {
    if (timerRef.current != null) return;
    timerRef.current = setInterval(() => {
      setState(s => {
        if (s.screen !== 'game' || !s.running) return s;
        const newTime = Math.max(0, s.timeLeft - 0.1);
        if (newTime <= 0) return endRunLogic(s, 'timeout');
        return { ...s, timeLeft: newTime };
      });
    }, 100);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current != null) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  // Resolve correct/wrong status transitions with a short delay
  useEffect(() => {
    if (state.status === 'correct') {
      const t = setTimeout(() => {
        setState(s => {
          const next = [...s.builtPath, LADDER[s.builtPath.length]];
          const score = s.score + 200;
          if (next.length >= LADDER.length) {
            return endRunLogic({ ...s, builtPath: next, score }, 'win');
          }
          const { tray, slots } = makeTray(LADDER[next.length]);
          return { ...s, builtPath: next, tray, slots, status: 'idle', score };
        });
      }, 480);
      return () => clearTimeout(t);
    }

    if (state.status === 'wrong') {
      const t = setTimeout(() => {
        setState(s => ({ ...s, slots: s.slots.map(() => null), status: 'idle' }));
      }, 480);
      return () => clearTimeout(t);
    }
  }, [state.status]);

  // Clear filled-but-wrong tutorial tray after a short delay
  useEffect(() => {
    if (state.tutSlots.includes(null) || state.tutStatus !== 'idle') return;
    const word = state.tutSlots.map(id => state.tutTray.find(t => t.id === id)?.letter).join('');
    if (word && word !== 'WORD') {
      const t = setTimeout(() => {
        setState(s => ({ ...s, tutSlots: s.tutSlots.map(() => null) }));
      }, 380);
      return () => clearTimeout(t);
    }
  }, [state.tutSlots, state.tutStatus]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  function go(screen: Screen) {
    if (screen === 'game') {
      const { tray, slots } = makeTray(LADDER[1]);
      setState(s => ({
        ...s, screen: 'game',
        builtPath: [LADDER[0]], tray, slots,
        status: 'idle', timeLeft: TOTAL_TIME, running: true, score: 0, result: null,
      }));
      return;
    }
    if (screen === 'tutorialTry') {
      const { tray, slots } = makeTray('WORD');
      setState(s => ({ ...s, screen, running: false, tutTray: tray, tutSlots: slots, tutStatus: 'idle' }));
      return;
    }
    if (screen === 'result') {
      setState(s => s.result
        ? { ...s, screen, running: false }
        : { ...s, screen, running: false, result: 'win', builtPath: LADDER.slice(), score: 847, unclaimed: 0.20, bestToday: 847 }
      );
      return;
    }
    setState(s => ({ ...s, screen, running: false }));
  }

  // ── Game actions ─────────────────────────────────────────────────────────────

  function placeTile(id: string) {
    setState(s => {
      if (s.status !== 'idle' || s.slots.includes(id)) return s;
      const i = s.slots.indexOf(null);
      if (i < 0) return s;
      const slots = [...s.slots];
      slots[i] = id;
      return { ...s, slots };
    });
  }

  function removeSlot(idx: number) {
    setState(s => {
      if (s.status !== 'idle' || !s.slots[idx]) return s;
      const slots = [...s.slots];
      slots[idx] = null;
      return { ...s, slots };
    });
  }

  function confirm() {
    setState(s => {
      if (s.slots.includes(null) || s.status !== 'idle') return s;
      const word = s.slots.map(id => s.tray.find(t => t.id === id)!.letter).join('');
      const target = LADDER[s.builtPath.length];
      if (word === target) return { ...s, status: 'correct' };
      return { ...s, status: 'wrong', timeLeft: Math.max(0, s.timeLeft - 3) };
    });
  }

  // ── Tutorial actions ─────────────────────────────────────────────────────────

  function placeTut(id: string) {
    setState(s => {
      if (s.tutStatus === 'done' || s.tutSlots.includes(id)) return s;
      const i = s.tutSlots.indexOf(null);
      if (i < 0) return s;
      const tutSlots = [...s.tutSlots];
      tutSlots[i] = id;
      const word = tutSlots.map(tid => s.tutTray.find(t => t.id === tid)?.letter).join('');
      const tutStatus = !tutSlots.includes(null) && word === 'WORD' ? 'done' as const : 'idle' as const;
      return { ...s, tutSlots, tutStatus };
    });
  }

  function removeTut(idx: number) {
    setState(s => {
      if (s.tutStatus === 'done' || !s.tutSlots[idx]) return s;
      const tutSlots = [...s.tutSlots];
      tutSlots[idx] = null;
      return { ...s, tutSlots };
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const p = getPalette(state.dark);
  const A = ACCENT;

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: p.board,
      backgroundImage: `radial-gradient(${p.dot} 1px, transparent 0)`,
      backgroundSize: '23px 23px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 16px 64px',
      fontFamily: "'Archivo', sans-serif",
      transition: 'background .25s',
      boxSizing: 'border-box',
    }}>

      {/* ── Page header ── */}
      <div style={{
        width: '100%', maxWidth: '792px', marginBottom: '26px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: '16px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ font: '900 30px Archivo', letterSpacing: '-1.2px', color: p.ink }}>
            WORD<span style={{ color: A }}>ZAPPER</span>
          </div>
          <div style={{ font: "400 13px 'Space Mono'", color: p.ink3, marginTop: '5px' }}>
            Mobile word game · 6 screens · the Game screen is live — hit PLAY and climb COLD → WARM.
          </div>
        </div>

        {/* Light / Dark toggle */}
        <div style={{
          display: 'flex', background: p.surface,
          border: `1.5px solid ${p.line}`, borderRadius: '11px', padding: '4px', gap: '2px',
        }}>
          {(['light', 'dark'] as const).map(mode => {
            const active = mode === 'dark' ? state.dark : !state.dark;
            return (
              <button
                key={mode}
                onClick={() => setState(s => ({ ...s, dark: mode === 'dark' }))}
                style={{
                  border: 'none', borderRadius: '8px', padding: '7px 12px',
                  font: "700 12px 'Space Mono'", cursor: 'pointer',
                  background: active ? p.ink : 'transparent',
                  color: active ? p.bg : p.ink2,
                }}
              >
                {mode === 'light' ? '☀ Light' : '☾ Dark'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div style={{ display: 'flex', gap: '26px', alignItems: 'flex-start', maxWidth: '792px', width: '100%' }}>

        {/* Navigation sidebar */}
        <div style={{
          flex: 'none', width: '182px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          position: 'sticky', top: '24px',
        }}>
          <div style={{ font: "700 10px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: p.ink2, padding: '0 4px 4px' }}>
            Screens
          </div>
          {SCREENS.map(id => {
            const active = state.screen === id;
            const isGame = id === 'game';
            return (
              <button
                key={id}
                onClick={() => go(id)}
                style={{
                  position: 'relative', display: 'block', width: '100%', textAlign: 'left',
                  border: `1.5px solid ${p.line}`, background: p.surface, color: p.ink3,
                  borderRadius: '11px', padding: '11px 14px',
                  font: "700 12.5px 'Space Mono'", cursor: 'pointer',
                }}
              >
                {NAV_LABELS[id]}
                {active && (
                  <span style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', padding: '0 14px',
                    background: isGame ? A : p.ink,
                    color: '#fff',
                    borderRadius: '10px',
                  }}>
                    {NAV_LABELS[id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Phone frame */}
        <div style={{
          background: '#100d0b', borderRadius: '46px', padding: '11px',
          boxShadow: '0 28px 64px rgba(20,16,12,.45)', flex: 'none',
        }}>
          <div style={{
            width: '390px', height: '844px', background: p.bg,
            borderRadius: '36px', overflow: 'hidden',
            position: 'relative', display: 'flex', flexDirection: 'column',
            transition: 'background .25s',
          }}>
            {/* Status bar */}
            <div style={{
              height: '46px', flex: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 26px', font: "700 14px 'Space Mono'", color: p.ink,
            }}>
              <span>9:41</span>
              <span style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', letterSpacing: '1px' }}>
                ▮▮▮
                <span style={{ opacity: 0.6 }}>●</span>
                <span style={{ border: `1.5px solid ${p.ink}`, borderRadius: '3px', padding: '1px 4px', fontSize: '9px' }}>82</span>
              </span>
            </div>

            {/* Screen content */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}>
              {state.screen === 'home' && (
                <HomeScreen state={state} p={p} go={go} todayRows={TODAY_ROWS} />
              )}
              {state.screen === 'tutorialWatch' && (
                <TutorialWatchScreen state={state} p={p} go={go} />
              )}
              {state.screen === 'tutorialTry' && (
                <TutorialTryScreen state={state} p={p} go={go} placeTut={placeTut} removeTut={removeTut} />
              )}
              {state.screen === 'game' && (
                <GameScreen state={state} p={p} go={go} placeTile={placeTile} removeSlot={removeSlot} confirm={confirm} />
              )}
              {state.screen === 'result' && (
                <ResultScreen state={state} p={p} go={go} />
              )}
              {state.screen === 'claim' && (
                <ClaimScreen
                  state={state} p={p} go={go}
                  setClaimState={cs => setState(s => ({ ...s, claimState: cs, claimed: false }))}
                  doClaim={() => setState(s => ({ ...s, claimed: true }))}
                />
              )}
              {state.screen === 'leaderboard' && (
                <LeaderboardScreen
                  state={state} p={p} go={go}
                  setLbTab={tab => setState(s => ({ ...s, lbTab: tab }))}
                  todayRows={TODAY_ROWS}
                  allRows={ALL_ROWS}
                />
              )}
            </div>

            {/* Home indicator bar */}
            <div style={{ height: '26px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '128px', height: '5px', borderRadius: '999px', background: p.ink, opacity: 0.7 }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function endRunLogic(s: AppState, outcome: 'win' | 'timeout'): AppState {
  const bonus = Math.round(s.timeLeft * 10);
  const final = s.score + (outcome === 'win' ? bonus : 0);
  const unclaimed = computeGEarned(final);
  const best = s.bestToday == null ? final : Math.max(s.bestToday, final);
  return {
    ...s,
    running: false,
    result: outcome,
    score: final,
    screen: 'result',
    bestToday: best,
    unclaimed,
    streak: outcome === 'win' ? s.streak + 1 : s.streak,
  };
}
