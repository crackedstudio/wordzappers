import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getTodayPuzzle, getTodayDateStr } from '../lib/puzzles';
import { buildShareText, copyToClipboard } from '../lib/share';

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
  const shareText = buildShareText(isWin ? puzzle.path : builtPath, score, dateStr);

  async function handleShare() {
    const ok = await copyToClipboard(shareText);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  function handlePlayAgain() {
    startRun();
    navigate('/game');
  }

  return (
    <div className="page">
      <div className="page-scroll">
        <div style={{ padding: '24px 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── Outcome header ──────────────────────────────────────────── */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ font: "700 11px 'Space Mono'", letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink2)', margin: 0 }}>
              {isWin ? 'Reached the target' : 'Clock ran out'}
            </p>
            <h2 style={{
              font: '900 42px Archivo', letterSpacing: '-1.2px', margin: '6px 0 4px',
              color: isWin ? 'var(--ink)' : '#c1432e',
            }}>
              {isWin ? 'You made it!' : "Time's up"}
            </h2>
            <p style={{ font: "400 14px 'Space Mono'", color: 'var(--ink3)', margin: 0 }}>
              {climbed} of {rungs} rungs climbed
            </p>
          </div>

          {/* ── Score + G$ ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, background: 'var(--target-bg)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
              <p style={{ font: "700 9px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 4px' }}>Score</p>
              <p style={{ font: "800 36px 'Space Mono'", color: 'var(--target-ink)', margin: 0, lineHeight: '1' }}>{score}</p>
            </div>
            <div style={{ flex: 1, background: 'var(--green-bg)', border: '1.5px solid var(--green-line)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
              <p style={{ font: "700 9px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--green-ink)', margin: '0 0 4px' }}>G$ earned</p>
              <p style={{ font: "800 30px 'Space Mono'", color: 'var(--green-ink)', margin: 0, lineHeight: '1' }}>{unclaimed.toFixed(2)} G$</p>
            </div>
          </div>

          {/* ── Streak chip ─────────────────────────────────────────────── */}
          <div className="chip" style={{ alignSelf: 'flex-start' }}>
            🔥 {isWin ? `Day ${streak} — streak continues!` : `Streak at ${streak} days`}
          </div>

          {/* ── Speed bonus (win only) ───────────────────────────────────── */}
          {isWin && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--surface)', border: '1.5px solid var(--line)',
              borderRadius: '12px', padding: '11px 16px',
            }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <span style={{ font: "700 13px 'Space Mono'", color: 'var(--ink2)' }}>Speed bonus included in score</span>
            </div>
          )}

          {/* ── Path replay ─────────────────────────────────────────────── */}
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: '16px', padding: '16px' }}>
            <p style={{ font: "700 10px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink2)', margin: '0 0 12px' }}>
              Your path
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {builtPath.map((word, rowIdx) => {
                const isLast = rowIdx === builtPath.length - 1;
                return (
                  <div key={rowIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ font: "700 11px 'Space Mono'", color: 'var(--ink2)', width: '16px', textAlign: 'right' }}>
                      {rowIdx + 1}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {word.split('').map((l, j) => (
                        <div key={j} style={{
                          width: '30px', height: '36px', borderRadius: '7px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          font: '800 16px Archivo',
                          background: isLast && isWin ? 'var(--accent)' : 'var(--tile)',
                          boxShadow: isLast && isWin ? 'inset 0 -3px 0 rgba(0,0,0,.18)' : 'inset 0 -3px 0 var(--tile-edge)',
                          color: isLast && isWin ? '#fff' : 'var(--tile-ink)',
                        }}>
                          {l}
                        </div>
                      ))}
                    </div>
                    {isLast && !isWin && (
                      <span style={{ font: "700 11px 'Space Mono'", color: '#c1432e' }}>⏱</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Share card ──────────────────────────────────────────────── */}
          <div style={{
            background: '#1e1a16', borderRadius: '16px', padding: '18px',
            fontFamily: "'Space Mono', monospace", color: '#f4f0e8',
            border: '1.5px solid rgba(255,255,255,.07)',
          }}>
            <p style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '1px', margin: '0 0 8px' }}>
              WORDZAPPER 🪜
            </p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#f6c46b', margin: '0 0 6px' }}>
              {puzzle.path[0]} → {target}
            </p>
            <p style={{ fontSize: '16px', letterSpacing: '3px', margin: '0 0 8px' }}>
              {'●'.repeat(climbed)}{'○'.repeat(rungs - climbed)}
            </p>
            <p style={{ fontSize: '13px', margin: '0 0 8px', color: '#b9b0a3' }}>
              Score: {score}
            </p>
            <p style={{ fontSize: '12px', color: '#7a6e64', margin: 0 }}>wordzapper.app</p>
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <button
            onClick={handleShare}
            style={{
              width: '100%', border: '1.5px solid var(--line)', borderRadius: '14px', padding: '15px',
              font: '800 15px Archivo', color: copied ? 'var(--green-ink)' : 'var(--ink)',
              background: copied ? 'var(--green-bg)' : 'var(--surface)', cursor: 'pointer',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy result'}
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePlayAgain}
              style={{ flex: 1, border: '1.5px solid var(--line)', borderRadius: '14px', padding: '15px', font: '800 15px Archivo', color: 'var(--ink)', background: 'var(--surface)', cursor: 'pointer' }}
            >
              Play again
            </button>
            <button
              onClick={() => navigate('/claim')}
              style={{ flex: 1, border: 'none', borderRadius: '14px', padding: '15px', font: '800 15px Archivo', color: '#06381c', background: '#00c853', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,200,83,.3)' }}
            >
              Claim G$
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
