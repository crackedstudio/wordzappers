import { useNavigate } from 'react-router-dom';
import { Gamepad2, Check, BadgeCheck, AlertTriangle, Flame, Smartphone, ExternalLink } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useClaim } from '../hooks/useClaim';
import { computeGEarned } from '../lib/scoring';
import { isMiniPay } from '../lib/wallet';
import { GOODDOLLAR_VERIFY_URL } from '../lib/chain';
import BottomNav from '../components/BottomNav';

export default function Claim() {
  const navigate = useNavigate();
  const { bestToday, streak, claimed } = useGameStore();
  const { phase, address, txHash, error, claim, retry } = useClaim();

  const hasEarnings  = (bestToday ?? 0) > 0;
  const gEarned      = bestToday ? computeGEarned(bestToday, streak) : 0;
  const totalReward  = gEarned.toFixed(2);
  const inMiniPay    = isMiniPay();

  // ── No earnings yet ──────────────────────────────────────────────────────
  if (!hasEarnings && !claimed) {
    return (
      <div className="page">
        <div className="topbar">
          <span className="topbar-title">Claim G$</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '20px' }}>
          <Gamepad2 size={56} strokeWidth={1.5} color="var(--ink3)" />
          <div>
            <p style={{ font: '800 22px Archivo', color: 'var(--ink)', margin: '0 0 8px' }}>Play first, earn after</p>
            <p style={{ font: "400 14px 'Space Mono'", color: 'var(--ink2)', margin: 0 }}>
              Complete a run to unlock your daily G$ reward.
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/')}>Play now →</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Already claimed ──────────────────────────────────────────────────────
  if (claimed || phase === 'done') {
    return (
      <div className="page">
        <div className="topbar">
          <span className="topbar-title">Claim G$</span>
        </div>
        <div className="anim-rise" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '20px' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: '#00c853', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(0,200,83,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Check size={52} strokeWidth={3} color="#fff" />
          </div>
          <div>
            <h2 style={{ font: '900 30px Archivo', color: 'var(--ink)', margin: '0 0 8px' }}>G$ Claimed!</h2>
            <p style={{ font: "400 14px 'Space Mono'", color: 'var(--ink2)', margin: '0 0 6px' }}>
              {totalReward} G$ sent to your wallet
            </p>
            <p style={{ font: "400 12px 'Space Mono'", color: 'var(--ink3)', margin: '0 0 10px' }}>
              Your daily universal basic income 💚
            </p>
            {txHash && (
              <a
                href={`https://celoscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ font: "400 11px 'Space Mono'", color: 'var(--accent)', textDecoration: 'none' }}
              >
                View on Celoscan ↗
              </a>
            )}
          </div>
          <button className="btn-primary" onClick={() => navigate('/')}>Back to lobby</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Not a GoodDollar citizen ─────────────────────────────────────────────
  if (phase === 'not-citizen') {
    return (
      <div className="page">
        <div className="topbar">
          <span className="topbar-title">Claim G$</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '24px' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '24px',
            background: 'var(--surface)', border: '1.5px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BadgeCheck size={42} strokeWidth={1.5} color="var(--ink2)" />
          </div>
          <div>
            <h2 style={{ font: '800 22px Archivo', color: 'var(--ink)', margin: '0 0 10px', lineHeight: '1.3' }}>
              One-time identity check
            </h2>
            <p style={{ font: "400 13px 'Space Mono'", color: 'var(--ink2)', margin: 0, maxWidth: '280px', lineHeight: '1.6' }}>
              WordZapper G$ rewards go to real humans only — no bots. Complete GoodDollar's free face verification (takes ~1 min), then come back to claim.
            </p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href={GOODDOLLAR_VERIFY_URL}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Verify with GoodDollar <ExternalLink size={14} strokeWidth={2} />
              </button>
            </a>
            <button
              style={{ background: 'none', border: 'none', font: "700 13px 'Space Mono'", color: 'var(--accent)', cursor: 'pointer' }}
              onClick={retry}
            >
              I just verified — check again
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Checking identity ─────────────────────────────────────────────────────
  if (phase === 'idle' || phase === 'checking') {
    return (
      <div className="page">
        <div className="topbar">
          <span className="topbar-title">Claim G$</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--accent)', opacity: 0.6,
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <p style={{ font: "400 13px 'Space Mono'", color: 'var(--ink2)' }}>Checking identity…</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="page">
        <div className="topbar">
          <span className="topbar-title">Claim G$</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '20px' }}>
          <AlertTriangle size={48} strokeWidth={1.5} color="var(--accent)" />
          <div>
            <p style={{ font: '800 18px Archivo', color: 'var(--ink)', margin: '0 0 8px' }}>Something went wrong</p>
            <p style={{ font: "400 13px 'Space Mono'", color: 'var(--ink2)', margin: 0, maxWidth: '280px', lineHeight: '1.6' }}>
              {error}
            </p>
          </div>
          <button className="btn-primary" onClick={retry}>Try again</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Ready to claim ────────────────────────────────────────────────────────
  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';

  return (
    <div className="page">
      <div className="topbar">
        <span className="topbar-title">Claim G$</span>
        <span style={{ font: "400 11px 'Space Mono'", color: 'var(--ink2)' }}>
          {shortAddr}
        </span>
      </div>

      <div className="page-scroll" style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Amount */}
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <p style={{ font: "700 11px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink2)', margin: '0 0 8px' }}>
            Your daily G$ reward
          </p>
          <p style={{ font: "800 60px 'Space Mono'", color: '#00a345', margin: 0, lineHeight: '1' }}>
            {totalReward}
            <span style={{ fontSize: '28px', marginLeft: '8px' }}>G$</span>
          </p>
          <p style={{ font: "400 11px 'Space Mono'", color: 'var(--ink3)', margin: '8px 0 0' }}>
            Universal basic income, earned through play
          </p>
        </div>

        {/* Breakdown */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: '16px', padding: '6px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ font: '600 14px Archivo', color: 'var(--ink3)' }}>Score — {bestToday} pts</span>
            <span style={{ font: "700 14px 'Space Mono'", color: 'var(--ink)' }}>+{gEarned.toFixed(2)} G$</span>
          </div>
          {streak >= 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ font: '600 14px Archivo', color: 'var(--ink3)', display: 'flex', alignItems: 'center', gap: '5px' }}><Flame size={13} strokeWidth={2} /> {streak}-day streak</span>
              <span style={{ font: "700 14px 'Space Mono'", color: 'var(--ink)' }}>×{streak >= 30 ? '1.5' : streak >= 7 ? '1.25' : '1.1'}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{ font: '600 14px Archivo', color: 'var(--ink3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {inMiniPay ? <Smartphone size={13} strokeWidth={2} /> : <Check size={13} strokeWidth={2.5} />}
                {inMiniPay ? 'MiniPay verified' : 'GoodDollar verified'}
              </span>
            </span>
            <Check size={16} strokeWidth={2.5} color="#00a345" />
          </div>
        </div>

        <button
          onClick={claim}
          disabled={phase === 'claiming'}
          style={{
            width: '100%', background: '#00c853', border: 'none', borderRadius: '16px',
            padding: '19px', font: '900 18px Archivo', color: '#06381c',
            cursor: phase === 'claiming' ? 'default' : 'pointer',
            opacity: phase === 'claiming' ? 0.7 : 1,
            boxShadow: '0 6px 18px rgba(0,200,83,.35)',
          }}
        >
          {phase === 'claiming' ? 'Confirming on Celo…' : `Claim ${totalReward} G$`}
        </button>

        <p style={{ textAlign: 'center', font: "400 12px 'Space Mono'", color: 'var(--ink2)', margin: 0 }}>
          Powered by GoodDollar · Celo mainnet
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
