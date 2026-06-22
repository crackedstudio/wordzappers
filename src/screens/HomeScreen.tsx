import React from 'react';
import type { AppState, LeaderRow, Screen } from '../types';
import type { Palette } from '../theme';
import { LADDER, ACCENT, tileVal } from '../gameLogic';

interface Props {
  state: AppState;
  p: Palette;
  go: (s: Screen) => void;
  todayRows: LeaderRow[];
}

export default function HomeScreen({ state, p, go, todayRows }: Props) {
  const A = ACCENT;
  const target = LADDER[LADDER.length - 1];

  const SmallTile = ({ letter, dark }: { letter: string; dark?: boolean }) => (
    <div style={{
      position: 'relative', width: '31px', height: '40px', borderRadius: '8px',
      background: dark ? p.ink : p.tileface,
      boxShadow: dark ? 'none' : `inset 0 1px 0 ${p.tilehi}, inset 0 -4px 0 ${p.tileedge}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: '800 18px Archivo', color: dark ? p.bg : p.tileink,
    }}>
      {letter}
      {!dark && (
        <span style={{ position: 'absolute', right: '3px', bottom: '1px', font: "700 7px 'Space Mono'", opacity: 0.4 }}>
          {tileVal(letter)}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ padding: '18px 24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ font: '900 26px Archivo', letterSpacing: '-1px', color: p.ink }}>
          WORD<span style={{ color: A }}>ZAPPER</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: p.chipbg, border: `1.5px solid ${p.chipline}`,
          borderRadius: '999px', padding: '7px 13px',
        }}>
          <span style={{ fontSize: '15px' }}>🔥</span>
          <span style={{ font: "700 14px 'Space Mono'", color: p.chipink }}>{state.streak} days</span>
        </div>
      </div>

      {/* Unclaimed G$ banner */}
      {state.unclaimed > 0 && (
        <button
          onClick={() => go('claim')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: p.gbg, border: `1.5px solid ${p.gline}`,
            borderRadius: '14px', padding: '13px 16px', cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{
              width: '9px', height: '9px', borderRadius: '50%',
              background: '#00c853', boxShadow: '0 0 0 4px rgba(0,200,83,.2)',
              display: 'inline-block',
            }} />
            <span style={{ font: '700 14px Archivo', color: p.gink }}>
              {state.unclaimed.toFixed(2)} G$ ready to claim
            </span>
          </span>
          <span style={{ font: "700 13px 'Space Mono'", color: p.gink }}>→</span>
        </button>
      )}

      {/* Today's climb card */}
      <div style={{
        position: 'relative', background: p.surface, border: `1.5px solid ${p.line}`,
        borderRadius: '20px', padding: '22px 20px 20px',
        boxShadow: `0 6px 18px ${p.shadow}`, overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: A }} />
        <div style={{ font: "700 10px 'Space Mono'", letterSpacing: '2.5px', textTransform: 'uppercase', color: p.ink2, marginBottom: '18px' }}>
          Today's climb
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {LADDER[0].split('').map((l, i) => <SmallTile key={i} letter={l} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2px', flex: 'none' }}>
            <span style={{ font: "700 8px 'Space Mono'", letterSpacing: '.5px', color: p.ink2 }}>4 RUNGS</span>
            <span style={{ font: "700 20px 'Space Mono'", color: A, lineHeight: '1' }}>→</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {target.split('').map((l, i) => <SmallTile key={i} letter={l} dark />)}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, background: p.surface, border: `1.5px solid ${p.line}`, borderRadius: '14px', padding: '14px 16px' }}>
          <div style={{ font: "700 9px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: p.ink2 }}>Best today</div>
          <div style={{ font: "800 26px 'Space Mono'", color: p.ink, marginTop: '3px' }}>
            {state.bestToday == null ? '—' : state.bestToday}
          </div>
        </div>
        <div style={{ flex: 1, background: p.surface, border: `1.5px solid ${p.line}`, borderRadius: '14px', padding: '14px 16px' }}>
          <div style={{ font: "700 9px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: p.ink2 }}>Your rank</div>
          <div style={{ font: "800 26px 'Space Mono'", color: p.ink, marginTop: '3px' }}>#4</div>
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={() => go('game')}
        style={{
          width: '100%', border: 'none', borderRadius: '16px', padding: '19px',
          font: '900 19px Archivo', letterSpacing: '2px', color: '#fff',
          background: A, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(217,119,6,.4)',
        }}
      >
        PLAY
      </button>

      {/* Top 3 */}
      <div style={{ background: p.surface, border: `1.5px solid ${p.line}`, borderRadius: '16px', padding: '6px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px' }}>
          <span style={{ font: "700 10px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: p.ink2 }}>
            Today's top 3
          </span>
          <button
            onClick={() => go('leaderboard')}
            style={{ background: 'none', border: 'none', font: "700 11px 'Space Mono'", color: A, cursor: 'pointer' }}
          >
            All →
          </button>
        </div>
        {todayRows.slice(0, 3).map(r => (
          <div key={r.r} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 14px' }}>
            <span style={{ font: "700 13px 'Space Mono'", color: A, width: '16px' }}>{r.r}</span>
            <span style={{ flex: 1, font: '600 14px Archivo', color: p.ink }}>{r.n}</span>
            <span style={{ font: "700 14px 'Space Mono'", color: p.ink }}>{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
