import { useState, useEffect } from 'react';
import { useWriteContract } from 'wagmi';
import { useGameStore } from '../store/gameStore';
import { checkCitizen, checkAlreadyPlayed } from '../lib/wallet';
import { WORDZAPPER_CONTRACT, WORDZAPPER_ABI } from '../lib/chain';
import { computeGEarned } from '../lib/scoring';

export type ClaimPhase =
  | 'idle'
  | 'checking'
  | 'not-citizen'
  | 'ready'
  | 'claiming'
  | 'done'
  | 'error';

function scoreTier(score: number): number {
  if (score >= 3000) return 2;
  if (score >= 1500) return 1;
  return 0;
}

export function useClaim() {
  const { bestToday, walletAddress, doClaim } = useGameStore();
  const address = walletAddress as `0x${string}` | null;

  const [phase, setPhase] = useState<ClaimPhase>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Run identity + duplicate check once we have an address
  useEffect(() => {
    if (address) checkStatus(address);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function checkStatus(addr: `0x${string}`) {
    setPhase('checking');
    try {
      const [citizen, played] = await Promise.all([
        checkCitizen(addr),
        checkAlreadyPlayed(addr),
      ]);
      if (!citizen) { setPhase('not-citizen'); return; }
      if (played)   { doClaim(); setPhase('done'); return; }
      setPhase('ready');
    } catch {
      // If chain read fails (e.g. RPC hiccup), still allow attempt — contract will reject
      setPhase('ready');
    }
  }

  async function claim() {
    if (!bestToday || !address) return;
    setError(null);
    setPhase('claiming');
    try {
      const gEarned = computeGEarned(bestToday, 0);
      const tier = scoreTier(bestToday);
      const hash = await writeContractAsync({
        address: WORDZAPPER_CONTRACT,
        abi: WORDZAPPER_ABI,
        functionName: 'claimReward',
        args: [BigInt(bestToday), tier],
      });
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
    if (address) checkStatus(address);
    else setPhase('idle');
  }

  return { phase, address, txHash, error, claim, retry };
}
