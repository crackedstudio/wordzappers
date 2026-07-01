import { Trophy } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Leaderboard() {
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

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', textAlign: 'center', gap: '20px',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '22px',
          background: 'var(--surface)', border: '1.5px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trophy size={36} strokeWidth={1.5} color="var(--accent)" />
        </div>
        <div>
          <p style={{ font: '800 20px Archivo', color: 'var(--ink)', margin: '0 0 8px' }}>
            Coming soon
          </p>
          <p style={{ font: "400 13px 'Space Mono'", color: 'var(--ink2)', margin: 0, lineHeight: '1.6', maxWidth: '260px' }}>
            On-chain leaderboard is in development. Scores will be ranked directly from the Celo contract.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
