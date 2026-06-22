import React from 'react';
import type { AppState, LeaderRow, Screen } from '../types';
import type { Palette } from '../theme';
import { ACCENT } from '../gameLogic';

interface Props {
  state: AppState;
  p: Palette;
  go: (s: Screen) => void;
  setLbTab: (tab: 'today' | 'all') => void;
  todayRows: LeaderRow[];
  allRows: LeaderRow[];
}

export default function LeaderboardScreen({ state, p, go, setLbTab, todayRows, allRows }: Props) {
  const A = ACCENT;
  const rows = state.lbTab === 'today' ? todayRows : allRows;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, border: 'none', borderRadius: '8px', padding: '9px',
    font: "700 12px 'Space Mono'", cursor: 'pointer',
    background: active ? p.surface : 'transparent',
    color: active ? p.ink : p.ink2,
    boxShadow: active ? `0 1px 3px ${p.shadow}` : 'none',
  });

  return (
    <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ font: '900 26px Archivo', color: p.ink }}>Leaderboard</div>
        <button
          onClick={() => go('home')}
          style={{ background: 'none', border: 'none', font: "700 12px 'Space Mono'", color: p.ink2, cursor: 'pointer' }}
        >
          Home
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: p.surface2, borderRadius: '11px', padding: '4px' }}>
        <button onClick={() => setLbTab('today')} style={tabStyle(state.lbTab === 'today')}>Today</button>
        <button onClick={() => setLbTab('all')} style={tabStyle(state.lbTab === 'all')}>All-time</button>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {rows.map(r => (
          <div key={r.r} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px',
            borderRadius: '12px',
            background: r.me ? p.chipbg : p.surface,
            border: `1.5px solid ${r.me ? p.chipline : p.line}`,
          }}>
            <span style={{ font: "700 15px 'Space Mono'", color: r.me ? p.chipink : p.ink2, width: '26px' }}>
              {r.r}
            </span>
            <span style={{ flex: 1, font: '700 15px Archivo', color: p.ink }}>{r.n}</span>
            <span style={{ font: "700 15px 'Space Mono'", color: p.ink }}>{r.s.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
