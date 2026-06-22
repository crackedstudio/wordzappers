import React from 'react';
import type { AppState, Screen } from '../types';
import type { Palette } from '../theme';

interface Props {
  state: AppState;
  p: Palette;
  go: (s: Screen) => void;
  setClaimState: (cs: 'disconnected' | 'ready') => void;
  doClaim: () => void;
}

export default function ClaimScreen({ state, p, go, setClaimState, doClaim }: Props) {
  const { claimState, claimed, unclaimed } = state;
  const claimTotal = ((unclaimed || 0.20) + 0.05).toFixed(2);
  const earnedText = '+' + (unclaimed || 0.20).toFixed(2) + ' G$';

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, border: 'none', borderRadius: '8px', padding: '9px',
    font: "700 12px 'Space Mono'", cursor: 'pointer',
    background: active ? p.surface : 'transparent',
    color: active ? p.ink : p.ink2,
    boxShadow: active ? `0 1px 3px ${p.shadow}` : 'none',
  });

  return (
    <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '100%', boxSizing: 'border-box' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', background: p.surface2, borderRadius: '11px', padding: '4px' }}>
        <button onClick={() => setClaimState('disconnected')} style={tabStyle(claimState === 'disconnected')}>
          Not connected
        </button>
        <button onClick={() => setClaimState('ready')} style={tabStyle(claimState === 'ready')}>
          Claim ready
        </button>
      </div>

      {/* Disconnected state */}
      {claimState === 'disconnected' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '24px' }}>
          <div style={{
            width: '84px', height: '84px', borderRadius: '24px',
            background: p.gbg, border: `1.5px solid ${p.gline}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '800 38px Archivo', color: '#00a345',
          }}>
            G$
          </div>
          <div>
            <div style={{ font: '800 24px Archivo', color: p.ink, lineHeight: '1.25' }}>
              Connect your wallet<br />to claim your G$
            </div>
            <div style={{ font: "400 14px 'Space Mono'", color: p.ink2, marginTop: '10px', maxWidth: '240px' }}>
              Your rewards are waiting. No fees, no jargon — one tap.
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setClaimState('ready')}
              style={{
                width: '100%', background: p.ink, border: 'none',
                borderRadius: '14px', padding: '16px', font: '800 15px Archivo',
                color: p.bg, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
              }}
            >
              <span style={{ width: '18px', height: '18px', borderRadius: '5px', background: '#00c853', display: 'inline-block' }} />
              Connect MiniPay
            </button>
            <button style={{ background: 'none', border: 'none', font: "700 13px 'Space Mono'", color: '#d97706', cursor: 'pointer' }}>
              What is GoodDollar? ↗
            </button>
          </div>
        </div>
      )}

      {/* Ready state */}
      {claimState === 'ready' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '18px' }}>

          {!claimed ? (
            <>
              {/* Amount */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ font: "700 11px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: p.ink2 }}>
                  Available to claim
                </div>
                <div style={{ font: "800 56px 'Space Mono'", color: '#00a345', marginTop: '6px', lineHeight: '1' }}>
                  {claimTotal} G$
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ background: p.surface, border: `1.5px solid ${p.line}`, borderRadius: '16px', padding: '6px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${p.line}` }}>
                  <span style={{ font: '600 14px Archivo', color: p.ink3 }}>Today's earnings</span>
                  <span style={{ font: "700 14px 'Space Mono'", color: p.ink }}>{earnedText}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0' }}>
                  <span style={{ font: '600 14px Archivo', color: p.ink3 }}>🔥 Streak bonus</span>
                  <span style={{ font: "700 14px 'Space Mono'", color: p.ink }}>+0.05 G$</span>
                </div>
              </div>

              <button
                onClick={doClaim}
                style={{
                  width: '100%', background: '#00c853', border: 'none',
                  borderRadius: '14px', padding: '17px', font: '800 16px Archivo',
                  color: '#06381c', cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(0,200,83,.32)',
                }}
              >
                Claim {claimTotal} G$
              </button>
            </>
          ) : (
            <div className="wz-rise" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: '#00c853',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '900 46px Archivo', color: '#fff',
                boxShadow: '0 8px 24px rgba(0,200,83,.4)',
              }}>
                ✓
              </div>
              <div>
                <div style={{ font: '900 28px Archivo', color: p.ink }}>Claimed!</div>
                <div style={{ font: "400 14px 'Space Mono'", color: p.ink2, marginTop: '6px' }}>
                  {claimTotal} G$ added to your wallet
                </div>
              </div>
              <div style={{ background: p.surface, border: `1.5px solid ${p.line}`, borderRadius: '16px', padding: '16px 28px' }}>
                <div style={{ font: "700 9px 'Space Mono'", letterSpacing: '1.5px', textTransform: 'uppercase', color: p.ink2 }}>
                  Balance
                </div>
                <div style={{ font: "800 30px 'Space Mono'", color: '#00a345', marginTop: '2px' }}>4.62 G$</div>
              </div>
              <button
                onClick={() => go('home')}
                style={{
                  width: '100%', background: p.ink, border: 'none',
                  borderRadius: '14px', padding: '15px', font: '800 15px Archivo',
                  color: p.bg, cursor: 'pointer',
                }}
              >
                Back to lobby
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
