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

  const puzzle  = getTodayPuzzle();
  const today   = new Date().toISOString().slice(0, 10);
  const streakAtRisk = streak > 0 && lastPlayedDate !== today;
  const start  = puzzle.path[0];
  const target = puzzle.path[puzzle.path.length - 1];

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
      <div className="page-scroll">
        <div style={{ padding: '20px 20px 0' }}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h1 style={{ font: '900 28px Archivo', letterSpacing: '-1px', color: 'var(--ink)', margin: 0 }}>
                WORD<span style={{ color: 'var(--accent)' }}>ZAPPER</span>
              </h1>
              <p style={{ font: "400 12px 'Space Mono'", color: 'var(--ink3)', marginTop: '4px' }}>
                Climb the ladder · earn G$
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={toggleDark}
                style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: '10px', padding: '8px 12px', font: "700 13px 'Space Mono'", color: 'var(--ink2)', cursor: 'pointer' }}
                aria-label="Toggle dark mode"
              >
                {dark ? '☀' : '☾'}
              </button>
            </div>
          </div>

          {/* ── Streak-at-risk banner ───────────────────────────────────── */}
          {streakAtRisk && (
            <div style={{
              background: '#fff7e6', border: '1.5px solid #f59e0b', borderRadius: '12px',
              padding: '10px 16px', marginBottom: '12px',
              font: "700 13px 'Space Mono'", color: '#92400e', display: 'flex', gap: '8px',
            }}>
              <span>⚠️</span>
              <span>Play today or your {streak}-day streak ends at midnight!</span>
            </div>
          )}

          {/* ── Streak chip ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="chip">🔥 {streak} day streak</div>
            {bestToday != null && (
              <div style={{ font: "700 13px 'Space Mono'", color: 'var(--ink2)' }}>
                Best: <span style={{ color: 'var(--ink)' }}>{bestToday}</span>
              </div>
            )}
          </div>

          {/* ── Unclaimed banner ─────────────────────────────────────────── */}
          {unclaimed > 0 && (
            <button className="unclaimed-banner" onClick={() => navigate('/claim')} style={{ marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#00c853', boxShadow: '0 0 0 4px rgba(0,200,83,.2)', display: 'inline-block' }} />
                <span style={{ font: '700 14px Archivo', color: 'var(--green-ink)' }}>
                  {unclaimed.toFixed(2)} G$ ready to claim
                </span>
              </span>
              <span style={{ font: "700 13px 'Space Mono'", color: 'var(--green-ink)' }}>→</span>
            </button>
          )}

          {/* ── Today's climb card ──────────────────────────────────────── */}
          <div style={{
            position: 'relative', background: 'var(--surface)', border: '1.5px solid var(--line)',
            borderRadius: '20px', padding: '20px 18px 18px', marginBottom: '16px',
            boxShadow: '0 6px 18px var(--shadow)', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', background: 'var(--accent)' }} />
            <div style={{ font: "700 10px 'Space Mono'", letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink2)', marginBottom: '16px' }}>
              Today's climb
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {/* Start word tiles */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {start.split('').map((l, i) => (
                  <div key={i} className="tile tile--source tile--sm">
                    {l}
                    <span className="tile-val">{tileValue(l)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 4px' }}>
                <span style={{ font: "700 8px 'Space Mono'", color: 'var(--ink2)', letterSpacing: '.5px' }}>
                  {puzzle.path.length - 1} RUNGS
                </span>
                <span style={{ font: "800 22px 'Space Mono'", color: 'var(--accent)', lineHeight: '1' }}>→</span>
              </div>
              {/* Target word tiles */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {target.split('').map((l, i) => (
                  <div key={i} className="tile tile--sm" style={{ background: 'var(--ink)', color: 'var(--bg)', boxShadow: 'none', border: 'none' }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stats row ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Best today</div>
              <div className="stat-value">{bestToday ?? '—'}</div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">Your rank</div>
              <div className="stat-value">#4</div>
            </div>
          </div>

          {/* ── Play button ─────────────────────────────────────────────── */}
          <button className="btn-primary" onClick={handlePlay} style={{ marginBottom: '24px' }}>
            {tutorialDone ? 'PLAY' : 'HOW TO PLAY'}
          </button>

          {/* ── Today's top 3 ───────────────────────────────────────────── */}
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: '16px', padding: '4px 4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
              <span style={{ font: "700 10px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink2)' }}>
                Today's top 3
              </span>
              <button
                onClick={() => navigate('/leaderboard')}
                style={{ background: 'none', border: 'none', font: "700 11px 'Space Mono'", color: 'var(--accent)', cursor: 'pointer' }}
              >
                All →
              </button>
            </div>
            {MOCK_TOP3.map(r => (
              <div key={r.r} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderTop: '1px solid var(--line)' }}>
                <span style={{ font: "700 13px 'Space Mono'", color: 'var(--accent)', width: '18px' }}>{r.r}</span>
                <span style={{ flex: 1, font: '600 14px Archivo', color: 'var(--ink)' }}>{r.n}</span>
                <span style={{ font: "700 14px 'Space Mono'", color: 'var(--ink)' }}>{r.s.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ height: '8px' }} />
          </div>

          <div style={{ height: '20px' }} />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
