import { useEffect, useState } from 'react';
import { useWeb3Auth, useWeb3AuthConnect } from '@web3auth/modal/react';
import { Wallet, Loader2, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { connectWallet, isMiniPay, hasWallet } from '../lib/wallet';

type LocalPhase = 'idle' | 'wallet-connecting' | 'social-connecting' | 'error';

export default function Connect() {
  const { setWallet } = useGameStore();
  const [localPhase, setLocalPhase] = useState<LocalPhase>('idle');
  const [error, setError] = useState<string | null>(null);

  const { web3Auth } = useWeb3Auth();
  const { connect: web3authConnect, loading: socialLoading } = useWeb3AuthConnect();

  const inMiniPay   = isMiniPay();
  const walletFound = hasWallet();

  // Auto-connect MiniPay on mount
  useEffect(() => {
    if (inMiniPay) connectWalletDirect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connectWalletDirect() {
    setError(null);
    setLocalPhase('wallet-connecting');
    try {
      const addr = await connectWallet();
      setWallet(addr);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
      setLocalPhase('error');
    }
  }

  async function connectSocial() {
    setError(null);
    setLocalPhase('social-connecting');
    try {
      await web3authConnect();

      // Read address directly from the Web3Auth provider — don't rely on wagmi state sync
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = (web3Auth as any)?.provider;
      if (provider) {
        const accounts: string[] = await provider.request({ method: 'eth_accounts' });
        if (accounts?.[0]) {
          setWallet(accounts[0] as `0x${string}`);
          return;
        }
      }
      throw new Error('Could not retrieve wallet address after sign-in. Please try again.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
      setLocalPhase('error');
    }
  }

  const walletBusy = localPhase === 'wallet-connecting';
  const socialBusy = localPhase === 'social-connecting' || socialLoading;

  return (
    <div style={{
      width: '100%', height: '100dvh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
    }}>

      <div />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', width: '100%' }}>

        {/* Logo */}
        <div style={{
          width: '88px', height: '88px', borderRadius: '26px',
          background: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 28px rgba(0,0,0,.2)',
        }}>
          <span style={{ font: '900 28px Archivo', color: 'var(--accent)', letterSpacing: '-1px' }}>WZ</span>
        </div>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            font: '900 36px Archivo', letterSpacing: '-1px',
            color: 'var(--ink)', lineHeight: '1', margin: '0 0 10px',
          }}>
            WORD<span style={{ color: 'var(--accent)' }}>ZAPPER</span>
          </h1>
          <p style={{ font: "400 14px 'Space Mono'", color: 'var(--ink2)', margin: 0 }}>
            Play word ladders. Earn G$ every day.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {[
            'Daily puzzle — one letter changes per rung',
            'Earn G$ UBI — verified humans only',
            'Streaks & leaderboard — climb the ranks',
          ].map(text => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: '12px', padding: '12px 16px',
            }}>
              <span style={{ font: '900 10px Archivo', color: 'var(--accent)', flexShrink: 0 }}>◆</span>
              <span style={{ font: "400 13px 'Space Mono'", color: 'var(--ink2)', lineHeight: '1.4' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Auth options */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {localPhase === 'error' && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              background: 'var(--wrong-bg)', border: '1.5px solid var(--wrong-border)',
              borderRadius: '12px', padding: '12px 14px',
            }}>
              <AlertTriangle size={16} strokeWidth={2} color="var(--wrong-ink)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ font: "400 12px 'Space Mono'", color: 'var(--wrong-ink)', lineHeight: '1.5' }}>
                {error}
              </span>
            </div>
          )}

          {inMiniPay ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '18px',
              background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px',
            }}>
              <Loader2 size={18} strokeWidth={2} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
              <span style={{ font: "600 14px 'Space Mono'", color: 'var(--ink2)' }}>Connecting wallet…</span>
            </div>
          ) : (
            <>
              {/* Connect Wallet — uses window.ethereum directly, works with any injected wallet */}
              <button
                onClick={connectWalletDirect}
                disabled={walletBusy || socialBusy || !walletFound}
                style={{
                  width: '100%',
                  border: `1.5px solid ${walletFound ? 'var(--ink)' : 'var(--line)'}`,
                  borderRadius: '16px', padding: '17px',
                  font: '800 15px Archivo', letterSpacing: '0.5px',
                  cursor: (!walletFound || walletBusy || socialBusy) ? 'default' : 'pointer',
                  background: walletFound ? 'var(--ink)' : 'var(--surface2)',
                  color: walletFound ? 'var(--bg)' : 'var(--ink3)',
                  opacity: (walletBusy || socialBusy) ? 0.65 : 1,
                  transition: 'opacity .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: walletFound ? '0 4px 0 rgba(0,0,0,.2)' : 'none',
                }}
              >
                {walletBusy
                  ? <Loader2 size={18} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Wallet size={18} strokeWidth={2} />}
                {walletBusy ? 'Connecting…' : walletFound ? 'Connect Wallet' : 'No wallet detected'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                <span style={{ font: "400 11px 'Space Mono'", color: 'var(--ink3)', letterSpacing: '1px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              </div>

              {/* Social sign-in via Web3Auth */}
              <button
                onClick={connectSocial}
                disabled={walletBusy || socialBusy}
                style={{
                  width: '100%', border: '1.5px solid var(--line)',
                  borderRadius: '16px', padding: '17px',
                  font: '800 15px Archivo', letterSpacing: '0.5px',
                  cursor: (walletBusy || socialBusy) ? 'default' : 'pointer',
                  background: 'var(--surface)', color: 'var(--ink)',
                  opacity: (walletBusy || socialBusy) ? 0.65 : 1,
                  transition: 'opacity .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}
              >
                {socialBusy
                  ? <Loader2 size={18} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Sparkles size={18} strokeWidth={2} />}
                {socialBusy ? 'Opening sign-in…' : 'Sign in with Google / Email'}
              </button>

              {!walletFound && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="https://minipay.opera.com" target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                    <button style={{
                      width: '100%', borderRadius: '12px', padding: '12px',
                      font: "700 11px 'Space Mono'",
                      border: '1.5px solid var(--line)', background: 'var(--surface)',
                      color: 'var(--ink2)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    }}>
                      Get MiniPay <ExternalLink size={10} strokeWidth={2} />
                    </button>
                  </a>
                  <a href="https://valora.xyz" target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                    <button style={{
                      width: '100%', borderRadius: '12px', padding: '12px',
                      font: "700 11px 'Space Mono'",
                      border: '1.5px solid var(--line)', background: 'var(--surface)',
                      color: 'var(--ink2)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    }}>
                      Get Valora <ExternalLink size={10} strokeWidth={2} />
                    </button>
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p style={{
        font: "400 11px 'Space Mono'", color: 'var(--ink3)',
        textAlign: 'center', margin: '0 0 max(20px, env(safe-area-inset-bottom, 20px))',
      }}>
        Powered by GoodDollar · Celo mainnet
      </p>
    </div>
  );
}
