import React from 'react';
import type { AppState, Screen } from '../types';
import type { Palette } from '../theme';
import { ACCENT, tileVal } from '../gameLogic';

interface Props {
  state: AppState;
  p: Palette;
  go: (s: Screen) => void;
  placeTut: (id: string) => void;
  removeTut: (idx: number) => void;
}

export default function TutorialTryScreen({ state, p, go, placeTut, removeTut }: Props) {
  const A = ACCENT;
  const done = state.tutStatus === 'done';

  const trayStyle = (placed: boolean): React.CSSProperties => placed
    ? {
        position: 'relative', width: '54px', height: '66px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: p.placed, boxShadow: `inset 0 3px 6px ${p.shadow}`,
        color: 'transparent', font: '800 28px Archivo', cursor: 'default',
      }
    : {
        position: 'relative', width: '54px', height: '66px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: p.tileface,
        boxShadow: `inset 0 2px 0 ${p.tilehi}, inset 0 -5px 0 ${p.tileedge}, 0 3px 6px ${p.shadow}`,
        color: p.tileink, font: '800 28px Archivo', cursor: 'pointer', userSelect: 'none',
      };

  const slotStyle = (filled: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'relative', width: '54px', height: '66px', borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: '800 28px Archivo', userSelect: 'none', boxSizing: 'border-box',
    };
    if (!filled) return { ...base, border: `2px dashed ${p.slotline}`, background: p.slotbg, color: p.tileink };
    if (done) return { ...base, background: A, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.22)', color: '#fff' };
    return { ...base, background: p.slotfill, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.16)', color: state.dark ? '#241a0c' : '#3a2a12', cursor: 'pointer' };
  };

  return (
    <div style={{ padding: '18px 24px 28px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ font: "700 11px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: p.ink2 }}>
          Your turn · 2 of 2
        </span>
        <button
          onClick={() => go('game')}
          style={{ background: 'none', border: 'none', font: "700 12px 'Space Mono'", color: p.ink2, cursor: 'pointer' }}
        >
          Skip ✕
        </button>
      </div>

      {/* Interactive area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ font: '800 22px Archivo', color: p.ink }}>Tap the letters to spell</div>
          <div style={{ font: '900 40px Archivo', letterSpacing: '4px', color: A, marginTop: '6px' }}>WORD</div>
        </div>

        {/* Answer slots */}
        <div className={done ? 'wz-pop' : ''} style={{ display: 'flex', gap: '10px' }}>
          {state.tutSlots.map((id, idx) => {
            const filled = !!id;
            const letter = id ? state.tutTray.find(t => t.id === id)?.letter ?? '' : '';
            const val = id ? tileVal(letter) : '';
            return (
              <div
                key={idx}
                onClick={() => filled && !done ? removeTut(idx) : undefined}
                style={slotStyle(filled)}
              >
                <span>{letter}</span>
                {filled && (
                  <span style={{ position: 'absolute', right: '6px', bottom: '4px', font: "700 9px 'Space Mono'", opacity: 0.45 }}>
                    {val}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tile tray */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {state.tutTray.map(t => {
            const placed = state.tutSlots.includes(t.id);
            return (
              <div
                key={t.id}
                onClick={() => !placed ? placeTut(t.id) : undefined}
                style={trayStyle(placed)}
              >
                <span>{placed ? '' : t.letter}</span>
                {!placed && (
                  <span style={{ position: 'absolute', right: '6px', bottom: '4px', font: "700 9px 'Space Mono'", opacity: 0.45 }}>
                    {tileVal(t.letter)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {done ? (
        <button
          onClick={() => go('game')}
          style={{
            width: '100%', border: 'none', borderRadius: '16px', padding: '19px',
            font: '900 19px Archivo', letterSpacing: '2px', color: '#fff',
            background: A, cursor: 'pointer', boxShadow: '0 6px 18px rgba(217,119,6,.4)',
          }}
        >
          Nice! Start playing →
        </button>
      ) : (
        <div style={{
          textAlign: 'center', font: "400 13px 'Space Mono'", color: p.ink2,
          height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          Tap a placed letter to send it back.
        </div>
      )}
    </div>
  );
}
