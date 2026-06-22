import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import BottomNav from '../components/BottomNav';
import { getTodayPuzzle } from '../lib/puzzles';
import { tileValue } from '../lib/tiles';

const MOCK_TOP3 = [
  { r: 1, n: 'okaforjoy', s: 1240 },
  { r: 2, n: 'minty_g',   s: 1090 },
  { r: 3, n: 'dotun.eth', s: 980 },
];

export default function Home() {
  const navigate = useNavigate();
  const {
    streak, bestToday, unclaimed, tutorialDone, lastPlayedDate,
    startRun, startTutorial, toggleDark, dark,
  } = useGameStore();

  const puzzle = getTodayPuzzle();
  const today  = new Date().toISOString().slice(0, 10);
  const streakAtRisk = streak > 0 && lastPlayedDate !== today;
  const start  = puzzle.path[0];
  const target = puzzle.path[puzzle.path.length - 1];
  const rungs  = puzzle.path.length - 1;

  function handlePlay() {
    if (!tutorialDone) {
      startTutorial();
      navigate('/tutorial');
    } else {
      startRun();
      navigate('/game');
    }
  }

  return (
    <div className="page">
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ font: '900 22px Archivo', letterSpacing: '-.5px', color: 'var(--ink)', lineHeight: '1' }}>
            WORD<span style={{ color: 'var(--accent)' }}>ZAPPER</span>
          </h1>
          <p className="label-xs" style={{ marginTop: '3px', color: 'var(--ink3)' }}>
            Climb · Unscramble · Earn G$
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="chip" style={{ padding: '5px 11px', gap: '5px' }}>
            <span>🔥</span>
            <span style={{ fontSize: '13px' }}>{streak}</span>
          </div>
          <button
            onClick={toggleDark}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--surface2)', border: '1px solid var(--line)',
              font: '16px serif', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Toggle dark mode"
          >
            {dark ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <div className="page-scroll">
        <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* ── Streak-at-risk warning ─────────────────────────────────── */}
          {streakAtRisk && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#fffbeb', border: '1.5px solid #fbbf24', borderRadius: 'var(--r-md)',
              padding: '12px 16px', color: '#92400e',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
              <span style={{ font: "700 13px 'Space Mono'", lineHeight: '1.4' }}>
                Play today — your {streak}-day streak ends at midnight!
              </span>
            </div>
          )}

          {/* ── G$ unclaimed banner ────────────────────────────────────── */}
          {unclaimed > 0 && (
            <button className="unclaimed-banner" onClick={() => navigate('/claim')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#00c853', boxShadow: '0 0 0 4px rgba(0,200,83,.2)',
                  display: 'inline-block', flexShrink: 0,
                }} />
                <span style={{ font: '700 14px Archivo', color: 'var(--green-ink)' }}>
                  {unclaimed.toFixed(2)} G$ ready to claim
                </span>
              </span>
              <span style={{ font: "700 14px 'Space Mono'", color: 'var(--green-ink)' }}>→</span>
            </button>
          )}

          {/* ── Today's puzzle hero card ───────────────────────────────── */}
          <div style={{
            background: 'var(--target-bg)',
            borderRadius: 'var(--r-xl)',
            padding: '24px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* decorative gradient */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 'var(--r-xl)',
              background: 'radial-gradient(ellipse 120% 80% at 80% 110%, rgba(224,123,0,.18) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            <p className="label-xs" style={{ color: 'rgba(248,243,232,.45)', marginBottom: '16px' }}>
              Today's ladder · {rungs} rungs
            </p>

            {/* Start → Target preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Start word */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {start.split('').map((l, i) => (
                  <div key={i} className="tile tile--sm" style={{
                    background: 'rgba(255,255,255,.10)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12), 0 2px 0 rgba(0,0,0,.3)',
                    color: '#f8f3e8',
                  }}>
                    {l}
                  </div>
                ))}
              </div>

              {/* Arrow + step count */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  {puzzle.path.slice(1, -1).map((_, i) => (
                    <span key={i} style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: 'rgba(248,243,232,.3)', display: 'inline-block',
                    }} />
                  ))}
                </div>
                <span style={{
                  font: "700 10px 'Space Mono'",
                  color: 'rgba(248,243,232,.5)',
                  letterSpacing: '1px',
                }}>
                  {rungs} steps
                </span>
              </div>

              {/* Target word */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {target.split('').map((l, i) => (
                  <div key={i} className="tile tile--sm" style={{
                    background: 'var(--accent)',
                    boxShadow: '0 2px 0 rgba(0,0,0,.25), 0 4px 10px rgba(224,123,0,.4)',
                    color: '#fff',
                  }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <p style={{ font: "400 12px 'Space Mono'", color: 'rgba(248,243,232,.38)', marginTop: '16px' }}>
              60 seconds · one letter changes per rung
            </p>
          </div>

          {/* ── Stats ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Best today</div>
              <div className="stat-value">{bestToday ?? '—'}</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Your rank</div>
              <div className="stat-value">#4</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Streak</div>
              <div className="stat-value">{streak}d</div>
            </div>
          </div>

          {/* ── Play button ───────────────────────────────────────────── */}
          <button className="btn-primary" onClick={handlePlay} style={{ marginTop: '4px', fontSize: '19px', letterSpacing: '3px' }}>
            {tutorialDone ? 'PLAY NOW' : 'HOW TO PLAY'}
          </button>

          {/* ── Leaderboard teaser ────────────────────────────────────── */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px 10px',
              borderBottom: '1px solid var(--line)',
            }}>
              <span className="label-xs">Today's top 3</span>
              <button
                onClick={() => navigate('/leaderboard')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  font: "700 11px 'Space Mono'", color: 'var(--accent)',
                }}
              >
                See all →
              </button>
            </div>
            {MOCK_TOP3.map(r => (
              <div key={r.r} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '13px 16px',
                borderBottom: r.r < 3 ? '1px solid var(--line)' : 'none',
              }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: r.r === 1 ? '#ffd700' : r.r === 2 ? '#c0c0c0' : '#cd7f32',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: "700 11px 'Space Mono'", color: '#18150f', flexShrink: 0,
                }}>
                  {r.r}
                </span>
                <span style={{ flex: 1, font: '600 15px Archivo', color: 'var(--ink)' }}>{r.n}</span>
                <span style={{ font: "700 14px 'Space Mono'", color: 'var(--ink)' }}>{r.s.toLocaleString()}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}
