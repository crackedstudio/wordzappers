import React from 'react';
import type { AppState, Screen } from '../types';
import type { Palette } from '../theme';
import { LADDER, ACCENT } from '../gameLogic';

interface Props {
  state: AppState;
  p: Palette;
  go: (s: Screen) => void;
}

export default function ResultScreen({ state, p, go }: Props) {
  const A = ACCENT;
  const isWin = state.result === 'win';
  const transitions = LADDER.length - 1;
  const climbed = state.builtPath.length - 1;
  const filledDots = '●'.repeat(climbed) + '○'.repeat(transitions - climbed);

  const pathRows = state.builtPath.map((word, rowIdx) => ({
    n: rowIdx + 1,
    word,
    isLast: rowIdx === state.builtPath.length - 1,
  }));

  return (
    <div style={{ padding: '22px 24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ font: "700 11px 'Space Mono'", letterSpacing: '3px', textTransform: 'uppercase', color: p.ink2 }}>
          {isWin ? 'Reached the target' : 'Clock ran out'}
        </div>
        <div style={{ font: '900 40px Archivo', letterSpacing: '-1.2px', color: isWin ? p.ink : '#c1432e', marginTop: '4px' }}>
          {isWin ? 'You made it!' : "Time's up"}
        </div>
        <div style={{ font: "400 14px 'Space Mono'", color: p.ink3, marginTop: '4px' }}>
          {climbed} of {transitions} rungs climbed
        </div>
      </div>

      {/* Score + G$ */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, background: p.targetbg, borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ font: "700 9px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: A }}>Score</div>
          <div style={{ font: "800 34px 'Space Mono'", color: p.targetink, marginTop: '2px' }}>{state.score}</div>
        </div>
        <div style={{ flex: 1, background: p.gbg, border: `1.5px solid ${p.gline}`, borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ font: "700 9px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: p.gink }}>G$ earned</div>
          <div style={{ font: "800 30px 'Space Mono'", color: p.gink, marginTop: '2px' }}>
            {state.unclaimed.toFixed(2)} G$
          </div>
        </div>
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: p.chipbg, border: `1.5px solid ${p.chipline}`, borderRadius: '12px', padding: '11px 15px' }}>
        <span style={{ fontSize: '16px' }}>🔥</span>
        <span style={{ font: '700 13px Archivo', color: p.chipink }}>
          {isWin
            ? `Streak continues — day ${state.streak}  (+1)`
            : `Streak held at day ${state.streak}`}
        </span>
      </div>

      {/* Path replay */}
      <div style={{ background: p.surface, border: `1.5px solid ${p.line}`, borderRadius: '16px', padding: '16px' }}>
        <div style={{ font: "700 10px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: p.ink2, marginBottom: '12px' }}>
          Your path
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pathRows.map(({ n, word, isLast }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ font: "700 11px 'Space Mono'", color: p.ink2, width: '14px' }}>{n}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {word.split('').map((l, j) => (
                  <div key={j} style={{
                    width: '28px', height: '34px', borderRadius: '7px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    font: '800 16px Archivo',
                    background: isLast ? A : p.tileface,
                    boxShadow: isLast ? 'inset 0 -3px 0 rgba(0,0,0,.18)' : `inset 0 -3px 0 ${p.tileedge}`,
                    color: isLast ? '#fff' : p.tileink,
                  }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speed bonus callout (win only) */}
      {isWin && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: p.surface, border: `1.5px solid ${p.line}`,
          borderRadius: '12px', padding: '11px 16px',
        }}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <span style={{ font: "700 13px 'Space Mono'", color: p.ink2 }}>
            Speed bonus included in score
          </span>
        </div>
      )}

      {/* Share card */}
      <div style={{ background: '#26221e', borderRadius: '16px', padding: '18px', fontFamily: "'Space Mono'", color: '#f4f0e8', border: '1.5px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '1px' }}>WORDZAPPER 🪜 — June 21</div>
        <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '8px', color: '#f6c46b' }}>
          {LADDER[0]} → {LADDER[LADDER.length - 1]}
        </div>
        <div style={{ fontSize: '16px', letterSpacing: '3px', marginTop: '6px' }}>
          {filledDots}{'   '}Score: {state.score}
        </div>
        <div style={{ fontSize: '13px', color: '#b9b0a3', marginTop: '8px' }}>wordzapper.app</div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => go('game')}
          style={{
            flex: 1, background: p.surface, border: `1.5px solid ${p.slotline}`,
            borderRadius: '14px', padding: '15px', font: '800 15px Archivo',
            color: p.ink, cursor: 'pointer',
          }}
        >
          Play again
        </button>
        <button
          onClick={() => go('claim')}
          style={{
            flex: 1, background: '#00c853', border: 'none',
            borderRadius: '14px', padding: '15px', font: '800 15px Archivo',
            color: '#06381c', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,200,83,.3)',
          }}
        >
          Claim G$
        </button>
      </div>
    </div>
  );
}
