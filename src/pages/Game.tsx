import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getTodayPuzzle } from '../lib/puzzles';
import { tileValue } from '../lib/tiles';
import { TOTAL_TIME } from '../lib/scoring';

export default function Game() {
  const navigate  = useNavigate();
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    builtPath, tray, slots, status, timeLeft, running, score, runResult,
    placeTile, removeSlot, confirmAnswer,
    advanceRung, resetWrongGuess,
  } = useGameStore();

  const puzzle = getTodayPuzzle();
  const target = puzzle.path[puzzle.path.length - 1];

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      const s = useGameStore.getState();
      if (!s.running) return;
      const next = Math.max(0, s.timeLeft - 0.1);
      if (next <= 0) {
        useGameStore.getState().triggerTimeout();
      } else {
        useGameStore.setState({ timeLeft: next });
      }
    }, 100);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [running]);

  // ── Navigate when run ends ────────────────────────────────────────────────
  useEffect(() => {
    if (runResult) navigate('/result');
  }, [runResult, navigate]);

  // ── Status transitions (correct → advance, wrong → clear) ─────────────────
  useEffect(() => {
    if (status === 'correct') {
      const t = setTimeout(() => advanceRung(), 480);
      return () => clearTimeout(t);
    }
    if (status === 'wrong') {
      const t = setTimeout(() => resetWrongGuess(), 480);
      return () => clearTimeout(t);
    }
  }, [status, advanceRung, resetWrongGuess]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') confirmAnswer();
      if (e.key === 'Backspace') {
        const { slots: s } = useGameStore.getState();
        const last = [...s].reverse().findIndex(id => id !== null);
        if (last >= 0) removeSlot(s.length - 1 - last);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmAnswer, removeSlot]);

  const confirmEnabled = !slots.includes(null) && status === 'idle';
  const low = timeLeft <= 8 && running;
  const pct = Math.max(0, Math.min(100, (timeLeft / TOTAL_TIME) * 100));
  const nowWord = builtPath[builtPath.length - 1] ?? puzzle.path[0];

  const slotClass = (filled: boolean) => {
    if (!filled) return 'tile tile--slot';
    if (status === 'correct') return 'tile tile--slot correct';
    if (status === 'wrong')   return 'tile tile--slot wrong';
    return 'tile tile--slot filled';
  };

  return (
    <div className="page" style={{ padding: '16px 20px 20px', justifyContent: 'space-between' }}>

      {/* ── Header: progress + score + quit ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          {puzzle.path.map((_, i) => (
            <span key={i} style={{
              width: '11px', height: '11px', borderRadius: '50%', display: 'inline-block',
              background: i < builtPath.length ? 'var(--accent)' : 'var(--slot-line)',
              boxShadow: i < builtPath.length ? '0 0 0 3px rgba(217,119,6,.2)' : 'none',
              transition: 'background .2s',
            }} />
          ))}
        </div>
        <span style={{ font: "700 15px 'Space Mono'", color: 'var(--ink2)' }}>{score}</span>
        <button
          onClick={() => { useGameStore.setState({ running: false }); navigate('/'); }}
          style={{ background: 'none', border: 'none', font: "700 12px 'Space Mono'", color: 'var(--ink2)', cursor: 'pointer' }}
        >
          Quit
        </button>
      </div>

      {/* ── Target word ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--target-bg)', borderRadius: '16px', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 14px var(--shadow)',
      }}>
        <span style={{ font: "700 10px 'Space Mono'", letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)' }}>
          Target
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {target.split('').map((l, i) => (
            <div key={i} style={{
              width: '38px', height: '46px', borderRadius: '9px',
              background: 'var(--target-tile)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '800 22px Archivo', color: 'var(--target-ink)',
            }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Current word (Now) ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0 0' }}>
        <span style={{ font: "700 10px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink2)' }}>Now</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {nowWord.split('').map((l, i) => (
            <div key={i} style={{
              width: '28px', height: '34px', borderRadius: '6px',
              background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '700 16px Archivo', color: 'var(--ink2)',
            }}>
              {l}
            </div>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', font: "400 11px 'Space Mono'", color: 'var(--ink2)' }}>
          one letter changes
        </span>
      </div>

      {/* ── Tile play area ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>

        {/* Answer slots */}
        <div className={status === 'wrong' ? 'anim-shake' : status === 'correct' ? 'anim-pop' : ''}
          style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {slots.map((id, idx) => {
            const letter = id ? tray.find(t => t.id === id)?.letter ?? '' : '';
            return (
              <div
                key={idx}
                className={slotClass(!!id)}
                onClick={() => id ? removeSlot(idx) : undefined}
              >
                <span>{letter}</span>
                {letter && <span className="tile-val">{tileValue(letter)}</span>}
              </div>
            );
          })}
        </div>

        {/* Tray tiles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {tray.map(t => {
            const placed = slots.includes(t.id);
            return (
              <div
                key={t.id}
                className={`tile tile--source${placed ? ' placed' : ''}`}
                onClick={() => !placed ? placeTile(t.id) : undefined}
              >
                <span>{placed ? '' : t.letter}</span>
                {!placed && <span className="tile-val">{tileValue(t.letter)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Status feedback ──────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center', height: '22px', marginBottom: '8px',
        font: "700 13px 'Space Mono'",
        color: status === 'wrong' ? '#d6604a' : status === 'correct' ? 'var(--accent)' : 'var(--ink2)',
      }}>
        {status === 'wrong'
          ? 'Try again  −3s'
          : status === 'correct'
            ? 'Nice — climbing! ↑'
            : confirmEnabled
              ? 'Press Enter or tap CONFIRM'
              : ' '}
      </div>

      {/* ── Confirm button ───────────────────────────────────────────────── */}
      <button
        onClick={() => confirmEnabled ? confirmAnswer() : undefined}
        style={{
          width: '100%', border: 'none', borderRadius: '15px', padding: '17px',
          font: '900 17px Archivo', letterSpacing: '1.5px',
          cursor: confirmEnabled ? 'pointer' : 'default',
          background: confirmEnabled ? 'var(--ink)' : 'var(--surface2)',
          color: confirmEnabled ? 'var(--bg)' : 'var(--ink2)',
          transition: 'background .15s',
          boxShadow: confirmEnabled ? '0 4px 12px var(--shadow)' : 'none',
          marginBottom: '14px',
        }}
      >
        {status === 'correct' ? 'CLIMBING…' : 'CONFIRM'}
      </button>

      {/* ── Timer ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="timer-bar" style={{ flex: 1 }}>
          <div
            className={`timer-fill${low ? ' low' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={low ? 'anim-pulse' : ''}
          style={{ font: "700 15px 'Space Mono'", color: low ? '#c1432e' : 'var(--ink)', width: '38px', textAlign: 'right' }}
        >
          {Math.ceil(timeLeft)}s
        </span>
      </div>
    </div>
  );
}
