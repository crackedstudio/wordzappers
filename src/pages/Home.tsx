import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisconnect } from 'wagmi';
import { useWeb3AuthDisconnect } from '@web3auth/modal/react';
import { Flame, Sun, Moon, AlertTriangle, Sparkles, LogOut } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import BottomNav from '../components/BottomNav';
import { getTodayPuzzle, DIFFICULTY_LABELS } from '../lib/puzzles';
import { tileValue } from '../lib/tiles';
import { getTimeLimit, computeGEarned } from '../lib/scoring';

// Scale preview tiles so they fit the hero card even for 6-letter words
function heroTileSize(wordLen: number) {
  if (wordLen <= 4) return { w: 30, h: 38, fs: 14 };
  if (wordLen <= 5) return { w: 24, h: 30, fs: 11 };
  return                   { w: 20, h: 26, fs: 9  };
}

const MOCK_TOP3 = [
  { r: 1, n: 'okaforjoy', s: 1240 },
  { r: 2, n: 'minty_g',   s: 1090 },
  { r: 3, n: 'dotun.eth', s: 980 },
];

export default function Home() {
  const navigate = useNavigate();
  const {
    streak, bestToday, unclaimed, tutorialDone, lastPlayedDate,
    walletAddress, startRun, startTutorial, toggleDark, dark, disconnect,
  } = useGameStore();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : '';

  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { disconnect: web3authDisconnect } = useWeb3AuthDisconnect();

  async function handleDisconnect() {
    setShowDisconnect(false);
    try { await web3authDisconnect(); } catch { /* not connected via Web3Auth */ }
    try { wagmiDisconnect(); } catch { /* not connected via wagmi */ }
    disconnect(); // clear gameStore
  }

  const puzzle    = getTodayPuzzle();
  const today     = new Date().toISOString().slice(0, 10);
  const streakAtRisk = streak > 0 && lastPlayedDate !== today;
  const start     = puzzle.path[0];
  const target    = puzzle.path[puzzle.path.length - 1];
  const rungs     = puzzle.path.length - 1;
  const wordLen   = target.length;
  const hts       = heroTileSize(wordLen);
  const timeLimit = getTimeLimit(wordLen);
  const diffLabel = DIFFICULTY_LABELS[puzzle.difficulty ?? 'easy'];
  // Max G$ if player wins perfectly (score ≈ top tier) with current streak
  const maxG      = computeGEarned(wordLen >= 6 ? 3500 : wordLen >= 5 ? 2200 : 1200, streak);

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
            Play · Climb · Earn daily G$ UBI
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
          <div className="chip" style={{ padding: '5px 11px', gap: '5px' }}>
            <Flame size={14} strokeWidth={2} />
            <span style={{ fontSize: '13px' }}>{streak}</span>
          </div>

          {/* Wallet address chip — tap to reveal disconnect */}
          <button
            onClick={() => setShowDisconnect(v => !v)}
            style={{
              height: '36px', borderRadius: '10px', padding: '0 10px',
              background: 'var(--surface2)', border: '1px solid var(--line)',
              font: "700 11px 'Space Mono'", color: 'var(--ink2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
              letterSpacing: '0.3px',
            }}
          >
            {shortAddr}
          </button>

          {/* Disconnect popover */}
          {showDisconnect && (
            <div style={{
              position: 'absolute', top: '44px', right: 0, zIndex: 50,
              background: 'var(--surface)', border: '1.5px solid var(--line)',
              borderRadius: '12px', padding: '4px',
              boxShadow: 'var(--shadow-md)',
              minWidth: '140px',
            }}>
              <button
                onClick={handleDisconnect}
                style={{
                  width: '100%', border: 'none', background: 'none',
                  padding: '10px 14px', borderRadius: '9px',
                  font: "700 12px 'Space Mono'", color: '#c1432e',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  textAlign: 'left',
                }}
              >
                <LogOut size={13} strokeWidth={2} />
                Disconnect
              </button>
            </div>
          )}

          <button
            onClick={toggleDark}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--surface2)', border: '1px solid var(--line)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          </button>
        </div>
      </header>

      <div className="page-scroll">
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* ── Streak-at-risk warning ─────────────────────────────────── */}
          {streakAtRisk && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#fffbeb', border: '1.5px solid #fbbf24', borderRadius: 'var(--r-md)',
              padding: '12px 16px', color: '#92400e',
            }}>
              <AlertTriangle size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <p className="label-xs" style={{ color: 'rgba(248,243,232,.7)', margin: 0 }}>
                {diffLabel} · {rungs} rungs
              </p>
              {puzzle.isAI && (
                <span style={{
                  font: "700 9px 'Space Mono'", letterSpacing: '1px',
                  background: 'rgba(255,255,255,.12)', color: 'rgba(248,243,232,.7)',
                  borderRadius: '4px', padding: '2px 6px',
                }}>
                  <Sparkles size={9} strokeWidth={2} style={{ marginRight: 3 }} />AI
                </span>
              )}
            </div>

            {/* Start → Target preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Start word */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {start.split('').map((l, i) => (
                  <div key={i} style={{
                    width: `${hts.w}px`, height: `${hts.h}px`, borderRadius: '6px',
                    background: 'rgba(255,255,255,.10)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12), 0 2px 0 rgba(0,0,0,.3)',
                    color: '#f8f3e8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    font: `800 ${hts.fs}px Archivo`,
                  }}>
                    {l}
                  </div>
                ))}
              </div>

              {/* Step dots */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  {puzzle.path.slice(1, -1).map((_, i) => (
                    <span key={i} style={{
                      width: '4px', height: '4px', borderRadius: '50%',
                      background: 'rgba(248,243,232,.3)', display: 'inline-block',
                    }} />
                  ))}
                </div>
                <span style={{
                  font: "700 9px 'Space Mono'",
                  color: 'rgba(248,243,232,.75)',
                  letterSpacing: '1px',
                }}>
                  {rungs} steps
                </span>
              </div>

              {/* Target word */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {target.split('').map((l, i) => (
                  <div key={i} style={{
                    width: `${hts.w}px`, height: `${hts.h}px`, borderRadius: '6px',
                    background: 'var(--accent)',
                    boxShadow: '0 2px 0 rgba(0,0,0,.25), 0 4px 10px rgba(224,123,0,.4)',
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    font: `800 ${hts.fs}px Archivo`,
                  }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
              <p style={{ font: "400 12px 'Space Mono'", color: 'rgba(248,243,232,.65)', margin: 0 }}>
                {timeLimit}s · one letter changes per rung
              </p>
              <div style={{
                background: 'rgba(0,200,83,.18)', border: '1px solid rgba(0,200,83,.3)',
                borderRadius: '8px', padding: '4px 10px',
                font: "700 12px 'Space Mono'", color: '#4ade80',
              }}>
                ↑ {maxG.toFixed(2)} G$
              </div>
            </div>
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
