import React from 'react';
import type { AppState, Screen } from '../types';
import type { Palette } from '../theme';
import { LADDER, ACCENT, TOTAL_TIME, tileVal } from '../gameLogic';
import { hexA } from '../theme';

interface Props {
  state: AppState;
  p: Palette;
  go: (s: Screen) => void;
  placeTile: (id: string) => void;
  removeSlot: (idx: number) => void;
  confirm: () => void;
}

export default function GameScreen({ state, p, go, placeTile, removeSlot, confirm }: Props) {
  const A = ACCENT;
  const { status } = state;

  const confirmEnabled = !state.slots.includes(null) && status === 'idle';
  const low = state.timeLeft <= 5 && state.running;
  const clockPct = Math.max(0, Math.min(100, (state.timeLeft / TOTAL_TIME) * 100));

  const tileStyle = (placed: boolean): React.CSSProperties => placed
    ? {
        position: 'relative', width: '60px', height: '74px', borderRadius: '13px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: p.placed, boxShadow: `inset 0 3px 7px ${p.shadow}`,
        color: 'transparent', font: '800 32px Archivo', cursor: 'default',
      }
    : {
        position: 'relative', width: '60px', height: '74px', borderRadius: '13px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: p.tileface,
        boxShadow: `inset 0 2px 0 ${p.tilehi}, inset 0 -5px 0 ${p.tileedge}, 0 3px 7px ${p.shadow}`,
        color: p.tileink, font: '800 32px Archivo', cursor: 'pointer', userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      };

  const slotStyle = (filled: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'relative', width: '60px', height: '74px', borderRadius: '13px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: '800 32px Archivo', userSelect: 'none', boxSizing: 'border-box',
    };
    if (!filled) return { ...base, border: `2px dashed ${p.slotline}`, background: p.slotbg };
    if (status === 'correct') return { ...base, background: A, boxShadow: `inset 0 -5px 0 rgba(0,0,0,.22), 0 4px 14px ${hexA(A, .45)}`, color: '#fff', cursor: 'pointer' };
    if (status === 'wrong') return { ...base, background: state.dark ? '#3a201a' : '#f3d9d2', border: '2px solid #c1432e', color: '#e0795f', cursor: 'pointer' };
    return { ...base, background: p.slotfill, boxShadow: `inset 0 2px 0 rgba(255,255,255,.25), inset 0 -5px 0 rgba(0,0,0,.16), 0 3px 7px ${p.shadow}`, color: state.dark ? '#241a0c' : '#3a2a12', cursor: 'pointer' };
  };

  const rowClass = status === 'wrong' ? 'wz-shake' : status === 'correct' ? 'wz-pop' : '';
  const statusText = status === 'wrong' ? 'Not a word  −3s' : status === 'correct' ? 'Nice — climbing! ↑' : ' ';
  const statusColor = status === 'wrong' ? '#d6604a' : status === 'correct' ? A : p.ink2;

  const nowWord = state.builtPath[state.builtPath.length - 1] ?? LADDER[0];
  const targetWord = LADDER[LADDER.length - 1];

  return (
    <div style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

      {/* Progress dots + score + quit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {LADDER.map((_, i) => (
            <span key={i} style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: i < state.builtPath.length ? A : p.slotline,
              boxShadow: i < state.builtPath.length ? `0 0 0 3px ${hexA(A, .2)}` : 'none',
              transition: 'background .2s',
              display: 'inline-block',
            }} />
          ))}
        </div>
        <span style={{ font: "700 13px 'Space Mono'", color: p.ink2 }}>{state.score}</span>
        <button
          onClick={() => go('home')}
          style={{ background: 'none', border: 'none', font: "700 12px 'Space Mono'", color: p.ink2, cursor: 'pointer' }}
        >
          Quit
        </button>
      </div>

      {/* Target word */}
      <div style={{
        background: p.targetbg, borderRadius: '16px', padding: '13px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: `0 4px 14px ${p.shadow}`,
      }}>
        <span style={{ font: "700 10px 'Space Mono'", letterSpacing: '2.5px', textTransform: 'uppercase', color: A }}>
          Target
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {targetWord.split('').map((l, i) => (
            <div key={i} style={{
              width: '36px', height: '44px', borderRadius: '8px',
              background: p.targettile,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '800 21px Archivo', color: p.targetink,
            }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Current word label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 4px' }}>
        <span style={{ font: "700 10px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: p.ink2 }}>Now</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {nowWord.split('').map((l, i) => (
            <div key={i} style={{
              width: '26px', height: '32px', borderRadius: '6px',
              background: p.surface2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '700 15px Archivo', color: p.ink2,
            }}>
              {l}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ font: "400 11px 'Space Mono'", color: p.ink2 }}>one letter changes</span>
      </div>

      {/* Tile area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '22px' }}>

        {/* Answer slots */}
        <div className={rowClass} style={{ display: 'flex', justifyContent: 'center', gap: '9px' }}>
          {state.slots.map((id, idx) => {
            const filled = !!id;
            const letter = id ? state.tray.find(t => t.id === id)?.letter ?? '' : '';
            return (
              <div
                key={idx}
                onClick={() => filled ? removeSlot(idx) : undefined}
                style={slotStyle(filled)}
              >
                <span>{letter}</span>
                {filled && letter && (
                  <span style={{ position: 'absolute', right: '7px', bottom: '5px', font: "700 10px 'Space Mono'", opacity: 0.45 }}>
                    {tileVal(letter)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tray tiles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '9px' }}>
          {state.tray.map(t => {
            const placed = state.slots.includes(t.id);
            return (
              <div
                key={t.id}
                onClick={() => !placed ? placeTile(t.id) : undefined}
                style={tileStyle(placed)}
              >
                <span>{placed ? '' : t.letter}</span>
                {!placed && (
                  <span style={{ position: 'absolute', right: '7px', bottom: '5px', font: "700 10px 'Space Mono'", opacity: 0.45 }}>
                    {tileVal(t.letter)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center', height: '22px', font: "700 13px 'Space Mono'", color: statusColor, marginBottom: '8px' }}>
        {statusText}
      </div>

      {/* Confirm button */}
      <button
        onClick={confirmEnabled ? confirm : undefined}
        style={{
          width: '100%', border: 'none', borderRadius: '15px', padding: '17px',
          font: '900 17px Archivo', letterSpacing: '1.5px',
          cursor: confirmEnabled ? 'pointer' : 'default',
          background: confirmEnabled ? p.ink : (state.dark ? '#2e2820' : '#ddd2bd'),
          color: confirmEnabled ? p.bg : p.ink2,
          transition: 'background .15s',
          boxShadow: confirmEnabled ? `0 4px 12px ${p.shadow}` : 'none',
        }}
      >
        {status === 'correct' ? 'CLIMBING…' : 'CONFIRM'}
      </button>

      {/* Timer bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
        <div style={{ flex: 1, height: '12px', borderRadius: '999px', background: p.surface2, overflow: 'hidden', boxShadow: `inset 0 1px 2px ${p.shadow}` }}>
          <div
            className={low ? 'wz-pulse' : ''}
            style={{
              width: `${clockPct}%`, height: '100%',
              background: low ? '#c1432e' : A,
              borderRadius: '999px', transition: 'width .1s linear',
            }}
          />
        </div>
        <span
          className={low ? 'wz-pulse' : ''}
          style={{ font: "700 15px 'Space Mono'", color: low ? '#c1432e' : p.ink, width: '40px', textAlign: 'right' }}
        >
          {Math.ceil(state.timeLeft)}s
        </span>
      </div>
    </div>
  );
}
