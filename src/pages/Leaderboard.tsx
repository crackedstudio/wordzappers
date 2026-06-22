import { useGameStore } from '../store/gameStore';
import BottomNav from '../components/BottomNav';

const TODAY_ROWS = [
  { r: 1, n: 'okaforjoy', s: 1240 },
  { r: 2, n: 'minty_g',   s: 1090 },
  { r: 3, n: 'dotun.eth', s: 980  },
  { r: 4, n: 'You',       s: 900, me: true },
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

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { lbTab, setLbTab } = useGameStore();
  const rows = lbTab === 'today' ? TODAY_ROWS : ALL_ROWS;

  return (
    <div className="page">
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--line)',
        padding: '18px 20px 14px', flexShrink: 0,
      }}>
        <h1 style={{ font: '900 22px Archivo', letterSpacing: '-.5px', color: 'var(--ink)' }}>
          Leaderboard
        </h1>
      </header>

      {/* Tabs */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{
          display: 'flex', background: 'var(--surface2)',
          borderRadius: 'var(--r-md)', padding: '4px', gap: '4px',
        }}>
          {(['today', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setLbTab(tab)}
              style={{
                flex: 1, border: 'none', borderRadius: 'var(--r-sm)', padding: '10px',
                font: "700 13px 'Space Mono'", cursor: 'pointer',
                background: lbTab === tab ? 'var(--surface)' : 'transparent',
                color: lbTab === tab ? 'var(--ink)' : 'var(--ink2)',
                boxShadow: lbTab === tab ? 'var(--shadow-sm)' : 'none',
                transition: 'background .15s, color .15s',
              }}
            >
              {tab === 'today' ? 'Today' : 'All-time'}
            </button>
          ))}
        </div>
      </div>

      <div className="page-scroll" style={{ padding: '12px 16px 16px' }}>
        {rows.map(r => (
          <div
            key={r.r}
            className={`lb-row${r.me ? ' me' : ''}`}
          >
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: r.r <= 3 ? '18px serif' : "700 12px 'Space Mono'",
              color: r.me ? 'var(--chip-ink)' : 'var(--ink2)',
              background: r.me ? 'var(--chip-line)' : 'var(--surface2)',
            }}>
              {r.r <= 3 ? MEDAL[r.r - 1] : r.r}
            </span>
            <span style={{ flex: 1, font: `${r.me ? '800' : '600'} 15px Archivo`, color: 'var(--ink)' }}>
              {r.n}
            </span>
            <span style={{ font: "700 15px 'Space Mono'", color: r.me ? 'var(--chip-ink)' : 'var(--ink)' }}>
              {r.s.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
