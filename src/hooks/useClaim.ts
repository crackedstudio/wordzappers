import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  connectWallet,
  checkCitizen,
  checkAlreadyPlayed,
  claimOnChain,
  isMiniPay,
} from '../lib/wallet';

export type ClaimPhase =
  | 'idle'           // no wallet connected
  | 'connecting'     // requesting accounts
  | 'checking'       // isWhitelisted + hasPlayedToday
  | 'not-citizen'    // wallet not GoodDollar verified
  | 'ready'          // verified, hasn't played today
  | 'claiming'       // tx in flight
  | 'done'           // tx confirmed
  | 'error';

export function useClaim() {
  const { bestToday, doClaim, setWallet, walletAddress } = useGameStore();

  const [phase, setPhase] = useState<ClaimPhase>(
    walletAddress ? 'checking' : 'idle'
  );
  const [address, setAddress] = useState<`0x${string}` | null>(
    walletAddress as `0x${string}` | null
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  // Auto-connect when running inside MiniPay — no connect button needed
  useEffect(() => {
    if (isMiniPay() && phase === 'idle') {
      connect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    setError(null);
    setPhase('connecting');
    try {
      const addr = await connectWallet();
      setAddress(addr);
      setWallet(addr);
      await checkStatus(addr);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
      setPhase('error');
    }
  }

  async function checkStatus(addr: `0x${string}`) {
    setPhase('checking');
    try {
      const [citizen, played] = await Promise.all([
        checkCitizen(addr),
        // Skip on-chain check if contract not yet deployed (zero address)
        addr !== '0x0000000000000000000000000000000000000000'
          ? checkAlreadyPlayed(addr)
          : Promise.resolve(false),
      ]);
      if (!citizen) { setPhase('not-citizen'); return; }
      if (played)   { doClaim(); setPhase('done'); return; }
      setPhase('ready');
    } catch {
      // If check fails (e.g. contract not deployed), still show ready so the
      // contract itself will reject with the right error on submit.
      setPhase('ready');
    }
  }

  async function claim() {
    if (!bestToday || !address) return;
    setError(null);
    setPhase('claiming');
    try {
      const hash = await claimOnChain(bestToday);
      setTxHash(hash);
      doClaim();
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
      setPhase('error');
    }
  }

  function retry() {
    setError(null);
    setPhase(address ? 'ready' : 'idle');
  }

  return { phase, address, txHash, error, connect, claim, retry };
}
