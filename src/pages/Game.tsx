import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Loader2, X, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getTodayPuzzle } from '../lib/puzzles';
import { tileValue } from '../lib/tiles';
import { useHint, MAX_HINTS, HINT_TIME_COST } from '../hooks/useHint';

// Tile dimensions scale with word length so tiles always fit on screen
function tileMetrics(wordLen: number) {
  if (wordLen <= 4) return { w: 68, h: 78, fs: 28, gap: 10 };
  if (wordLen <= 5) return { w: 54, h: 66, fs: 22, gap: 8  };
  return                   { w: 44, h: 56, fs: 18, gap: 6  };
}

export default function Game() {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    builtPath, tray, slots, status, timeLeft, totalTime, running, score, runResult,
    placeTile, removeSlot, confirmAnswer,
    advanceRung, resetWrongGuess,
  } = useGameStore();

  const hint = useHint();

  const puzzle   = getTodayPuzzle();
  const target   = puzzle.path[puzzle.path.length - 1];
  const nowWord  = builtPath[builtPath.length - 1] ?? puzzle.path[0];
  const nextWord = puzzle.path[builtPath.length] ?? target;
  const wordLen  = target.length;
  const ts       = tileMetrics(wordLen);

  function handleHint() {
    if (hint.used >= MAX_HINTS || hint.state === 'loading' || !running) return;
    // Deduct time penalty before fetching
    useGameStore.setState(s => ({ timeLeft: Math.max(0, s.timeLeft - HINT_TIME_COST) }));
    hint.requestHint(nowWord, nextWord, target);
  }

  // ── Timer ─────────────────────────────────────────────────────────────────
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

  // ── Status transitions ────────────────────────────────────────────────────
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

  // ── Keyboard ──────────────────────────────────────────────────────────────
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
  const pct  = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const low  = timeLeft <= 8 && running;
  const secs = Math.ceil(timeLeft);

  const slotClass = (id: string | null) => {
    if (!id) return 'tile tile--slot';
    if (status === 'correct') return 'tile tile--slot correct';
    if (status === 'wrong')   return 'tile tile--slot wrong';
    return 'tile tile--slot filled';
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      minHeight: 0, background: 'var(--bg)', position: 'relative',
    }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px 8px', flexShrink: 0,
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {puzzle.path.map((_, i) => (
            <span key={i} className={`prog-dot${i < builtPath.length ? ' done' : ''}`} />
          ))}
        </div>

        {/* Score */}
        <span style={{ font: "700 18px 'Space Mono'", color: 'var(--ink)' }}>
          {score}
        </span>

        {/* Hint + Quit */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Hint button */}
          <button
            onClick={handleHint}
            disabled={hint.used >= MAX_HINTS || hint.state === 'loading' || !running}
            title={`Hint (−${HINT_TIME_COST}s)`}
            style={{
              background: hint.used >= MAX_HINTS ? 'var(--surface2)' : 'var(--accent-soft, #fff8e8)',
              border: '1.5px solid var(--line)',
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex', alignItems: 'center', gap: '4px',
              cursor: hint.used >= MAX_HINTS || !running ? 'default' : 'pointer',
              opacity: hint.used >= MAX_HINTS ? 0.4 : 1,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {hint.state === 'loading'
                ? <Loader2 size={14} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                : <Lightbulb size={14} strokeWidth={2} />}
            </span>
            {/* Remaining hints as dots */}
            <span style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: MAX_HINTS }).map((_, i) => (
                <span key={i} style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: i < hint.used ? 'var(--ink3)' : 'var(--accent)',
                }} />
              ))}
            </span>
          </button>

          <button
            onClick={() => { useGameStore.setState({ running: false }); navigate('/'); }}
            style={{
              background: 'var(--surface2)', border: 'none', borderRadius: '8px',
              padding: '6px 12px', font: "700 12px 'Space Mono'",
              color: 'var(--ink2)', cursor: 'pointer',
            }}
          >
            Quit
          </button>
        </div>
      </div>

      {/* ── Timer bar (full width) ───────────────────────────────────────── */}
      <div style={{ padding: '0 20px 10px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div className="timer-bar">
          <div className={`timer-fill${low ? ' low' : ''}`} style={{ width: `${pct}%` }} />
        </div>
        <span style={{
          font: "700 13px 'Space Mono'", width: '36px', textAlign: 'right', flexShrink: 0,
          color: low ? '#c1432e' : 'var(--ink2)',
        }} className={low ? 'anim-pulse' : ''}>
          {secs}s
        </span>
      </div>

      {/* ── Target word ─────────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
        <div style={{
          background: 'var(--target-bg)', borderRadius: 'var(--r-lg)',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p className="label-xs" style={{ color: 'rgba(248,243,232,.65)', marginBottom: '6px' }}>
              Target
            </p>
            <div style={{ display: 'flex', gap: '5px' }}>
              {target.split('').map((l, i) => (
                <div key={i} style={{
                  width: '38px', height: '44px', borderRadius: '8px',
                  background: 'var(--accent)',
                  boxShadow: '0 2px 0 rgba(0,0,0,.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: '800 20px Archivo', color: '#fff',
                }}>{l}</div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="label-xs" style={{ color: 'rgba(248,243,232,.65)', marginBottom: '6px' }}>
              Now
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              {nowWord.split('').map((l, i) => (
                <div key={i} style={{
                  width: '28px', height: '34px', borderRadius: '6px',
                  background: 'rgba(255,255,255,.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: '700 15px Archivo', color: 'rgba(248,243,232,.7)',
                }}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tile play area ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        minHeight: 'calc(76px + 16px + 76px + 24px)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: '16px', padding: '0 16px',
      }}>

        {/* Answer slots */}
        <div
          className={status === 'wrong' ? 'anim-shake' : status === 'correct' ? 'anim-pop' : ''}
          style={{ display: 'flex', justifyContent: 'center', gap: `${ts.gap}px` }}
        >
          {slots.map((id, idx) => {
            const letter = id ? tray.find(t => t.id === id)?.letter ?? '' : '';
            return (
              <div
                key={idx}
                className={slotClass(id)}
                onClick={() => id ? removeSlot(idx) : undefined}
                style={{ width: `${ts.w}px`, height: `${ts.h}px` }}
              >
                {letter && <span style={{ fontSize: `${ts.fs}px`, fontWeight: 800 }}>{letter}</span>}
                {letter && <span className="tile-val">{tileValue(letter)}</span>}
              </div>
            );
          })}
        </div>

        {/* Source tiles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: `${ts.gap}px` }}>
          {tray.map(t => {
            const placed = slots.includes(t.id);
            return (
              <div
                key={t.id}
                className={`tile tile--source${placed ? ' placed' : ''}`}
                onClick={() => !placed ? placeTile(t.id) : undefined}
                style={{ width: `${ts.w}px`, height: `${ts.h}px` }}
              >
                {!placed && <span style={{ fontSize: `${ts.fs}px`, fontWeight: 800 }}>{t.letter}</span>}
                {!placed && <span className="tile-val">{tileValue(t.letter)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hint overlay ────────────────────────────────────────────────── */}
      {(hint.state === 'shown' || hint.state === 'error') && (
        <div
          onClick={hint.dismiss}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'flex-end',
            zIndex: 50,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="anim-rise"
            style={{
              width: '100%',
              background: 'var(--bg)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 24px 36px',
              boxShadow: '0 -8px 32px rgba(0,0,0,.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', font: "700 11px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink2)' }}>
                <Lightbulb size={13} strokeWidth={2} /> AI Hint ({MAX_HINTS - hint.used} left)
              </span>
              <button
                onClick={hint.dismiss}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--ink2)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <p style={{
              font: '600 17px Archivo', color: 'var(--ink)', lineHeight: '1.5',
              margin: '0 0 8px',
            }}>
              {hint.text}
            </p>
            <p style={{ font: "400 11px 'Space Mono'", color: 'var(--ink3)', margin: 0 }}>
              Tap anywhere to dismiss · −{HINT_TIME_COST}s already deducted
            </p>
          </div>
        </div>
      )}

      {/* ── Status + Confirm ────────────────────────────────────────────── */}
      <div style={{
        padding: '8px 16px',
        paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 12px))',
        flexShrink: 0,
      }}>
        {/* Feedback line */}
        <div style={{
          textAlign: 'center', height: '20px', marginBottom: '10px',
          font: "700 12px 'Space Mono'",
          color: status === 'wrong'
            ? 'var(--wrong-ink)'
            : status === 'correct'
              ? 'var(--accent)'
              : 'var(--ink3)',
        }}>
          {status === 'wrong'
            ? '✗ Try again — 3s penalty'
            : status === 'correct'
              ? '+ Climbing up!'
              : confirmEnabled
                ? 'Tap CONFIRM or press Enter'
                : ' '}
        </div>

        {/* Confirm button */}
        <button
          onClick={() => confirmEnabled ? confirmAnswer() : undefined}
          style={{
            width: '100%', border: 'none', borderRadius: 'var(--r-lg)',
            padding: '19px',
            font: '900 16px Archivo', letterSpacing: '2.5px', textTransform: 'uppercase',
            cursor: confirmEnabled ? 'pointer' : 'default',
            background: confirmEnabled
              ? 'var(--ink)'
              : 'var(--surface2)',
            color: confirmEnabled ? 'var(--bg)' : 'var(--ink3)',
            boxShadow: confirmEnabled ? '0 4px 0 rgba(0,0,0,.25), var(--shadow-md)' : 'none',
            transition: 'background .12s, box-shadow .08s, transform .08s',
            transform: 'translateY(0)',
          }}
          onMouseDown={e => confirmEnabled && ((e.currentTarget.style.transform = 'translateY(2px)'))}
          onMouseUp={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {status === 'correct' ? 'Climbing…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
