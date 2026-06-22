import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import BottomNav from '../components/BottomNav';

export default function Claim() {
  const navigate = useNavigate();
  const {
    claimState, claimed, unclaimed, streak,
    walletAddress, bestToday,
    setClaimState, setWallet, doClaim,
  } = useGameStore();

  const claimTotal = ((unclaimed || 0.20) + 0.05).toFixed(2);
  const earnedText = `+${(unclaimed || 0.20).toFixed(2)} G$`;
  const hasEarnings = (unclaimed || 0) > 0;

  // Guard: no earnings yet
  if (!hasEarnings && !claimed) {
    return (
      <div className="page">
        <div className="topbar">
          <span className="topbar-title">Claim G$</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '20px' }}>
          <span style={{ fontSize: '56px' }}>🎮</span>
          <div>
            <p style={{ font: '800 22px Archivo', color: 'var(--ink)', margin: '0 0 8px' }}>Play first, earn after</p>
            <p style={{ font: "400 14px 'Space Mono'", color: 'var(--ink2)', margin: 0 }}>
              Complete a run to unlock your G$ reward.
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/')}>Play now →</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Step 1: Connect wallet
  if (!walletAddress && claimState !== 'claimed') {
    return (
      <div className="page">
        <div className="topbar">
          <span className="topbar-title">Claim G$</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '28px' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '24px',
            background: 'var(--green-bg)', border: '1.5px solid var(--green-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '800 38px Archivo', color: '#00a345',
          }}>
            G$
          </div>
          <div>
            <h2 style={{ font: '800 24px Archivo', color: 'var(--ink)', margin: '0 0 10px', lineHeight: '1.25' }}>
              Connect your wallet<br />to claim your G$
            </h2>
            <p style={{ font: "400 14px 'Space Mono'", color: 'var(--ink2)', margin: 0, maxWidth: '260px' }}>
              Your rewards are waiting. No fees, no jargon — one tap.
            </p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              onClick={() => {
                setClaimState('connecting');
                // Simulate MiniPay connection (real implementation: window.ethereum/Celo provider)
                setTimeout(() => setWallet('0x1234…abcd'), 800);
              }}
            >
              {claimState === 'connecting' ? (
                <span style={{ opacity: 0.7 }}>Connecting…</span>
              ) : (
                <>
                  <span style={{ width: '18px', height: '18px', borderRadius: '5px', background: '#00c853', display: 'inline-block' }} />
                  Connect MiniPay
                </>
              )}
            </button>
            <button style={{ background: 'none', border: 'none', font: "700 13px 'Space Mono'", color: 'var(--accent)', cursor: 'pointer' }}>
              What is GoodDollar? ↗
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Step 3: Already claimed today
  if (claimed || claimState === 'claimed') {
    return (
      <div className="page">
        <div className="topbar">
          <span className="topbar-title">Claim G$</span>
        </div>
        <div className="anim-rise" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '20px' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: '#00c853', display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '900 50px Archivo', color: '#fff',
            boxShadow: '0 8px 28px rgba(0,200,83,.4)',
          }}>
            ✓
          </div>
          <div>
            <h2 style={{ font: '900 30px Archivo', color: 'var(--ink)', margin: '0 0 8px' }}>Claimed!</h2>
            <p style={{ font: "400 14px 'Space Mono'", color: 'var(--ink2)', margin: 0 }}>
              {claimTotal} G$ added to your wallet
            </p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: '16px', padding: '16px 32px' }}>
            <p style={{ font: "700 9px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink2)', margin: '0 0 4px' }}>Balance</p>
            <p style={{ font: "800 32px 'Space Mono'", color: '#00a345', margin: 0 }}>4.62 G$</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/')}>Back to lobby</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Step 2: Claim ready
  return (
    <div className="page">
      <div className="topbar">
        <span className="topbar-title">Claim G$</span>
        <span style={{ font: "400 12px 'Space Mono'", color: 'var(--ink2)' }}>
          {walletAddress}
        </span>
      </div>

      <div className="page-scroll" style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Amount */}
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <p style={{ font: "700 11px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink2)', margin: '0 0 8px' }}>
            Available to claim
          </p>
          <p style={{ font: "800 60px 'Space Mono'", color: '#00a345', margin: 0, lineHeight: '1' }}>
            {claimTotal}
            <span style={{ fontSize: '28px', marginLeft: '8px' }}>G$</span>
          </p>
        </div>

        {/* Breakdown */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: '16px', padding: '6px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ font: '600 14px Archivo', color: 'var(--ink3)' }}>Today's earnings</span>
            <span style={{ font: "700 14px 'Space Mono'", color: 'var(--ink)' }}>{earnedText}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ font: '600 14px Archivo', color: 'var(--ink3)' }}>🔥 Streak bonus ({streak} days)</span>
            <span style={{ font: "700 14px 'Space Mono'", color: 'var(--ink)' }}>+0.05 G$</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{ font: '600 14px Archivo', color: 'var(--ink3)' }}>Score tier</span>
            <span style={{ font: "700 14px 'Space Mono'", color: 'var(--ink)' }}>
              {bestToday ? (bestToday >= 700 ? 'Top 25%' : bestToday >= 400 ? 'Top 50%' : 'Completed') : '—'}
            </span>
          </div>
        </div>

        <button
          onClick={doClaim}
          style={{
            width: '100%', background: '#00c853', border: 'none', borderRadius: '16px',
            padding: '19px', font: '900 18px Archivo', color: '#06381c', cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0,200,83,.35)',
          }}
        >
          Claim {claimTotal} G$
        </button>

        <p style={{ textAlign: 'center', font: "400 12px 'Space Mono'", color: 'var(--ink2)', margin: 0 }}>
          Powered by GoodDollar · Celo mainnet
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
