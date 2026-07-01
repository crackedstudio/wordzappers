import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useGameStore } from '../store/gameStore';
import { checkCitizen, checkAlreadyPlayed, claimOnChain, scoreTier } from '../lib/wallet';
import { WORDZAPPER_CONTRACT, WORDZAPPER_ABI } from '../lib/chain';

export type ClaimPhase =
  | 'idle'
  | 'checking'
  | 'not-citizen'
  | 'ready'
  | 'claiming'
  | 'done'
  | 'error';

export function useClaim() {
  const { bestToday, walletAddress, doClaim } = useGameStore();
  const address = walletAddress as `0x${string}` | null;

  const [phase, setPhase] = useState<ClaimPhase>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

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
      // RPC hiccup — allow attempt; contract will reject with the real reason
      setPhase('ready');
    }
  }

  async function claim() {
    if (!bestToday || !address) return;
    setError(null);
    setPhase('claiming');
    try {
      let hash: `0x${string}`;

      if (window.ethereum) {
        // Injected wallet path (MiniPay, MetaMask, Valora, Coinbase Wallet, etc.)
        // Use direct viem — works regardless of wagmi reconnect state after page reload.
        hash = await claimOnChain(bestToday);
      } else if (isConnected) {
        // Social login path (Web3Auth Google/email) — no window.ethereum, use wagmi connector.
        hash = await writeContractAsync({
          address: WORDZAPPER_CONTRACT,
          abi: WORDZAPPER_ABI,
          functionName: 'claimReward',
          args: [BigInt(bestToday), scoreTier(bestToday)],
        });
      } else {
        throw new Error('Wallet session expired — please disconnect and reconnect.');
      }

      setTxHash(hash);
      doClaim();
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed. Try again.');
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
