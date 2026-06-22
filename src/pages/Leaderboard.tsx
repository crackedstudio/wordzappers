import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import BottomNav from '../components/BottomNav';

const TODAY_ROWS = [
  { r: 1, n: 'okaforjoy', s: 1240 },
  { r: 2, n: 'minty_g',   s: 1090 },
  { r: 3, n: 'dotun.eth', s: 980  },
  { r: 4, n: 'You',       s: 900,  me: true },
  { r: 5, n: 'amaka_w',   s: 760  },
  { r: 6, n: 'kojo_42',   s: 690  },
  { r: 7, n: 'sunny_d',   s: 610  },
  { r: 8, n: '0x7f…a2',  s: 540  },
];

const ALL_ROWS = [
  { r: 1, n: 'minty_g',   s: 18420 },
  { r: 2, n: 'okaforjoy', s: 17110 },
  { r: 3, n: 'thelma.k',  s: 15980 },
  { r: 4, n: 'dotun.eth', s: 14200 },
  { r: 5, n: 'kojo_42',   s: 12640 },
  { r: 6, n: 'You',       s: 11890, me: true },
  { r: 7, n: 'amaka_w',   s: 9700  },
  { r: 8, n: 'sunny_d',   s: 8330  },
];

export default function Leaderboard() {
  const { lbTab, setLbTab } = useGameStore();
  const rows = lbTab === 'today' ? TODAY_ROWS : ALL_ROWS;

  const tabStyle = (active: boolean) => ({
    flex: 1, border: 'none', borderRadius: '8px', padding: '10px',
    font: "700 13px 'Space Mono'", cursor: 'pointer',
    background: active ? 'var(--surface)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink2)',
    boxShadow: active ? '0 1px 3px var(--shadow)' : 'none',
  } as React.CSSProperties);

  return (
    <div className="page">
      <div className="topbar">
        <span className="topbar-title">Leaderboard</span>
      </div>

      <div className="page-scroll" style={{ padding: '0 20px 16px' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'var(--surface2)', borderRadius: '11px',
          padding: '4px', marginBottom: '16px',
        }}>
          <button style={tabStyle(lbTab === 'today')} onClick={() => setLbTab('today')}>Today</button>
          <button style={tabStyle(lbTab === 'all')}   onClick={() => setLbTab('all')}>All-time</button>
        </div>

        {/* Rows */}
        {rows.map(r => (
          <div key={r.r} className={`lb-row${r.me ? ' me' : ''}`}>
            <span style={{ font: "700 15px 'Space Mono'", color: r.me ? 'var(--chip-ink)' : 'var(--ink2)', width: '24px' }}>
              {r.r}
            </span>
            <span style={{ flex: 1, font: '700 15px Archivo', color: 'var(--ink)' }}>{r.n}</span>
            <span style={{ font: "700 15px 'Space Mono'", color: 'var(--ink)' }}>{r.s.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
