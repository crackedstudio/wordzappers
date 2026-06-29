import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Flame, ClipboardCopy, Check, Share2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getTodayPuzzle, getTodayDateStr } from '../lib/puzzles';
import { buildShareText, copyToClipboard, buildTwitterUrl, buildWarpcastUrl } from '../lib/share';
import { computeGEarned } from '../lib/scoring';

export default function Result() {
  const navigate = useNavigate();
  const { builtPath, score, runResult, unclaimed, streak, startRun } = useGameStore();
  const [copied, setCopied] = useState(false);

  const puzzle   = getTodayPuzzle();
  const target   = puzzle.path[puzzle.path.length - 1];
  const isWin    = runResult === 'win';
  const rungs    = puzzle.path.length - 1;
  const climbed  = builtPath.length - 1;
  const dateStr  = getTodayDateStr();
  const gEarned  = computeGEarned(score, streak);
  const sharePath = isWin ? puzzle.path : builtPath;
  const shareText = buildShareText(sharePath, score, dateStr, isWin ? gEarned : undefined);

  async function handleShare() {
    const ok = await copyToClipboard(shareText);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2200); }
  }

  return (
    <div className="page">
      <div className="page-scroll">
        <div style={{
          padding: '20px 16px',
          paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom, 0px) + 20px))',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>

          {/* ── Outcome header ──────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
              {isWin
                ? <Trophy size={52} strokeWidth={1.5} color="var(--accent)" />
                : <Clock   size={52} strokeWidth={1.5} color="#c1432e" />}
            </div>
            <h2 style={{
              font: '900 36px Archivo', letterSpacing: '-1px', margin: '0 0 6px',
              color: isWin ? 'var(--ink)' : '#c1432e',
            }}>
              {isWin ? 'You made it!' : "Time's up"}
            </h2>
            <p style={{ font: "400 13px 'Space Mono'", color: 'var(--ink2)', margin: 0 }}>
              {climbed} of {rungs} rungs · {puzzle.path[0]} → {target}
            </p>
          </div>

          {/* ── Score + G$ ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="stat-label">Score</div>
              <div style={{ font: "800 40px 'Space Mono'", color: 'var(--ink)', lineHeight: '1', marginTop: '4px' }}>
                {score}
              </div>
            </div>
            <div style={{
              flex: 1, textAlign: 'center',
              background: 'var(--green-bg)', border: '1.5px solid var(--green-line)',
              borderRadius: 'var(--r-lg)', padding: '18px',
            }}>
              <div className="stat-label" style={{ color: 'var(--green-ink)' }}>G$ earned</div>
              <div style={{ font: "800 32px 'Space Mono'", color: 'var(--green-ink)', lineHeight: '1', marginTop: '4px' }}>
                {unclaimed.toFixed(2)}
              </div>
              {isWin && (
                <div style={{ font: "400 10px 'Space Mono'", color: 'var(--green-ink)', opacity: 0.7, marginTop: '3px' }}>
                  daily UBI
                </div>
              )}
            </div>
          </div>

          {/* ── Streak ──────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="chip" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} strokeWidth={2} />
              {isWin ? `${streak}-day streak — keep it up!` : `Streak: ${streak} days`}
            </div>
          </div>

          {/* ── Path replay ─────────────────────────────────────────────── */}
          <div className="card">
            <p className="label-xs" style={{ marginBottom: '14px' }}>Your path</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {builtPath.map((word, rowIdx) => {
                const isFinal = rowIdx === builtPath.length - 1;
                const isTarget = word === target;
                return (
                  <div key={rowIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ font: "600 11px 'Space Mono'", color: 'var(--ink3)', width: '18px', textAlign: 'right' }}>
                      {rowIdx + 1}
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {word.split('').map((l, j) => (
                        <div key={j} style={{
                          width: '34px', height: '40px', borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          font: '800 17px Archivo',
                          background: isTarget ? 'var(--accent)' : 'var(--tile-bg)',
                          boxShadow: isTarget ? '0 2px 0 rgba(0,0,0,.2)' : '0 2px 0 var(--tile-edge)',
                          color: isTarget ? '#fff' : 'var(--tile-ink)',
                          transition: 'background .2s',
                        }}>
                          {l}
                        </div>
                      ))}
                    </div>
                    {isFinal && !isWin && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', font: "700 11px 'Space Mono'", color: '#c1432e' }}><Clock size={11} strokeWidth={2} /> stopped</span>
                    )}
                    {isTarget && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', font: "700 11px 'Space Mono'", color: 'var(--accent)' }}><Check size={11} strokeWidth={2.5} /> target</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Share card ──────────────────────────────────────────────── */}
          <div style={{
            background: '#1a1512', borderRadius: 'var(--r-lg)', padding: '20px',
            border: '1px solid rgba(255,255,255,.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ font: "900 13px 'Space Mono'", color: '#f8f3e8', letterSpacing: '1px' }}>
                WORDZAPPER
              </span>
              <span style={{ font: "700 12px 'Space Mono'", color: '#a89880' }}>wordzapper.app</span>
            </div>
            <div style={{ font: "700 22px 'Space Mono'", color: 'var(--accent-light)', marginBottom: '8px' }}>
              {puzzle.path[0]} → {target}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              {Array.from({ length: rungs }, (_, i) => (
                <div key={i} style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: i < climbed ? 'var(--accent)' : 'rgba(255,255,255,.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>
                  {i < climbed ? '●' : '○'}
                </div>
              ))}
            </div>
            <div style={{ font: "400 12px 'Space Mono'", color: '#a89880' }}>
              Score {score} · {isWin ? 'Solved!' : `${climbed}/${rungs} rungs`} · {dateStr}
            </div>
          </div>

          {/* ── Share row ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleShare}
              style={{
                flex: 1, borderRadius: 'var(--r-lg)', padding: '14px 10px',
                font: '700 13px Archivo',
                border: `1.5px solid ${copied ? 'var(--green-line)' : 'var(--line)'}`,
                background: copied ? 'var(--green-bg)' : 'var(--surface)',
                color: copied ? 'var(--green-ink)' : 'var(--ink)',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                {copied ? <Check size={14} strokeWidth={2.5} /> : <ClipboardCopy size={14} strokeWidth={2} />}
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
            <a
              href={buildTwitterUrl(shareText)}
              target="_blank"
              rel="noreferrer"
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <button style={{
                width: '100%', borderRadius: 'var(--r-lg)', padding: '14px 10px',
                font: '700 13px Archivo',
                border: '1.5px solid var(--line)',
                background: 'var(--surface)', color: 'var(--ink)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}>
                {/* X/Twitter wordmark — not an emoji */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share
              </button>
            </a>
            <a
              href={buildWarpcastUrl(shareText)}
              target="_blank"
              rel="noreferrer"
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <button style={{
                width: '100%', borderRadius: 'var(--r-lg)', padding: '14px 10px',
                font: '700 13px Archivo',
                border: '1.5px solid var(--line)',
                background: 'var(--surface)', color: 'var(--ink)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}>
                <Share2 size={14} strokeWidth={2} /> Cast
              </button>
            </a>
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { startRun(); navigate('/game'); }}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Play again
            </button>
            <button
              onClick={() => navigate('/claim')}
              style={{
                flex: 1, border: 'none', borderRadius: 'var(--r-lg)', padding: '17px',
                font: '800 15px Archivo', color: '#052e16',
                background: '#00c853', cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,.18), 0 6px 20px rgba(0,200,83,.3)',
              }}
            >
              Claim G$
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
