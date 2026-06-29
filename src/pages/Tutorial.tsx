import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, TrendingUp } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { tileValue } from '../lib/tiles';

const WATCH_SCRAMBLED = ['D', 'R', 'O', 'W'];
const WATCH_FORMED    = ['W', 'O', 'R', 'D'];

export default function Tutorial() {
  const navigate = useNavigate();
  const {
    tutStep, tutTray, tutSlots, tutStatus,
    placeTutTile, removeTutSlot, clearTutSlots, nextTutStep,
    startRun,
  } = useGameStore();

  // Clear wrong tut arrangement after 380ms
  useEffect(() => {
    if (tutSlots.includes(null) || tutStatus !== 'idle') return;
    const word = tutSlots.map(id => tutTray.find(t => t.id === id)?.letter ?? '').join('');
    if (word && word !== 'WORD') {
      const t = setTimeout(() => clearTutSlots(), 380);
      return () => clearTimeout(t);
    }
  }, [tutSlots, tutStatus, tutTray, clearTutSlots]);

  function handleSkip() {
    startRun();
    navigate('/game');
  }

  function handleNext() {
    if (tutStep === 0) {
      nextTutStep(); // go to step 1 (try)
    } else if (tutStatus === 'done') {
      nextTutStep(); // marks tutorialDone, starts run, navigates
      navigate('/game');
    }
  }

  // ── Step 0: Watch ──────────────────────────────────────────────────────────
  if (tutStep === 0) {
    return (
      <div className="page" style={{ background: 'var(--bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0' }}>
          <span style={{ font: "700 11px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink2)' }}>
            How it works · 1 of 2
          </span>
          <button
            onClick={handleSkip}
            style={{ background: 'none', border: 'none', font: "700 12px 'Space Mono'", color: 'var(--ink2)', cursor: 'pointer' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Skip <X size={13} strokeWidth={2.5} /></span>
          </button>
        </div>

        <div style={{
          flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 'clamp(20px, 5dvh, 36px)', padding: '0 24px',
          overflowY: 'auto',
        }}>

          {/* Hero text */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ font: '900 34px Archivo', letterSpacing: '-1px', color: 'var(--ink)', lineHeight: '1.05', margin: 0 }}>
              Scramble.<br />Tap. Climb.
            </h2>
            <p style={{ font: "400 14px 'Space Mono'", color: 'var(--ink2)', marginTop: '12px' }}>
              Unscramble each rung against the clock.
            </p>
            <div style={{
              marginTop: '14px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--green-bg)', border: '1.5px solid var(--green-line)',
              borderRadius: '10px', padding: '8px 14px',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', font: "700 13px 'Space Mono'", color: 'var(--green-ink)' }}>
                <TrendingUp size={14} strokeWidth={2} /> Win → earn G$ every day
              </span>
            </div>
          </div>

          {/* Animated demo */}
          <div style={{ position: 'relative', width: `${4*66 + 3*10}px`, height: '76px' }}>
            <div className="sweep-cursor" />
            <div style={{ display: 'flex', gap: '10px' }}>
              {WATCH_SCRAMBLED.map((l, i) => (
                <div key={i} className="tile tile--source" style={{ cursor: 'default' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ font: "700 22px 'Space Mono'", color: 'var(--accent)' }}>↓</div>

          {/* Formed word bob animation */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {WATCH_FORMED.map((l, i) => (
              <div
                key={i}
                className={`tile anim-bob-${i}`}
                style={{
                  width: '66px', height: '76px', borderRadius: '10px',
                  background: 'var(--accent)',
                  boxShadow: '0 3px 0 rgba(0,0,0,.22), 0 6px 18px var(--accent-glow)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '28px', fontWeight: 800 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <button className="btn-primary" onClick={handleNext}>Try it →</button>
        </div>
      </div>
    );
  }

  // ── Step 1: Try ────────────────────────────────────────────────────────────
  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0' }}>
        <span style={{ font: "700 11px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink2)' }}>
          Your turn · 2 of 2
        </span>
        <button
          onClick={handleSkip}
          style={{ background: 'none', border: 'none', font: "700 12px 'Space Mono'", color: 'var(--ink2)', cursor: 'pointer' }}
        >
          Skip ✕
        </button>
      </div>

      <div style={{
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(18px, 4dvh, 32px)', padding: '0 24px',
        overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ font: '700 18px Archivo', color: 'var(--ink)', margin: 0 }}>Tap the letters to spell</p>
          <p style={{ font: '900 44px Archivo', letterSpacing: '4px', color: 'var(--accent)', margin: '8px 0 0', lineHeight: '1' }}>
            WORD
          </p>
        </div>

        {/* Answer slots */}
        <div className={tutStatus === 'done' ? 'anim-pop' : ''} style={{ display: 'flex', gap: '10px' }}>
          {tutSlots.map((id, idx) => {
            const letter = id ? tutTray.find(t => t.id === id)?.letter ?? '' : '';
            const filled = !!id;
            return (
              <div
                key={idx}
                className={`tile tile--slot${filled ? (tutStatus === 'done' ? ' correct' : ' filled') : ''}`}
                onClick={() => filled && tutStatus !== 'done' ? removeTutSlot(idx) : undefined}
              >
                {letter && <span style={{ fontSize: '28px', fontWeight: 800 }}>{letter}</span>}
                {filled && letter && <span className="tile-val">{tileValue(letter)}</span>}
              </div>
            );
          })}
        </div>

        {/* Tray */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {tutTray.map(t => {
            const placed = tutSlots.includes(t.id);
            return (
              <div
                key={t.id}
                className={`tile tile--source${placed ? ' placed' : ''}`}
                onClick={() => !placed ? placeTutTile(t.id) : undefined}
              >
                {!placed && <span style={{ fontSize: '28px', fontWeight: 800 }}>{t.letter}</span>}
                {!placed && <span className="tile-val">{tileValue(t.letter)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '20px', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
        {tutStatus === 'done' ? (
          <button className="btn-primary" onClick={handleNext}>
            Nice! Start playing →
          </button>
        ) : (
          <p style={{ textAlign: 'center', width: '100%', font: "400 13px 'Space Mono'", color: 'var(--ink2)' }}>
            Tap a placed letter to return it.
          </p>
        )}
      </div>
    </div>
  );
}
