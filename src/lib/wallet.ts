import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { celo } from 'viem/chains';
import {
  WORDZAPPER_CONTRACT,
  WORDZAPPER_ABI,
  IDENTITY_CONTRACT,
  IDENTITY_ABI,
} from './chain';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMiniPay?: boolean;
      isValora?: boolean;
    };
  }
}

export function isMiniPay(): boolean {
  return !!window.ethereum?.isMiniPay;
}

export function hasWallet(): boolean {
  return !!window.ethereum;
}

function publicClient() {
  return createPublicClient({ chain: celo, transport: http() });
}

function walletClient() {
  if (!window.ethereum) throw new Error('No wallet found. Open in MiniPay, Valora, or MetaMask.');
  return createWalletClient({ chain: celo, transport: custom(window.ethereum) });
}

export async function connectWallet(): Promise<`0x${string}`> {
  if (!window.ethereum) throw new Error('No wallet found. Open in MiniPay, Valora, or MetaMask.');
  // Request accounts — works for both MiniPay (auto-approves) and MetaMask (prompts)
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const client = walletClient();
  const [address] = await client.getAddresses();
  if (!address) throw new Error('No accounts found. Unlock your wallet and try again.');
  return address;
}

export async function checkCitizen(address: `0x${string}`): Promise<boolean> {
  return publicClient().readContract({
    address: IDENTITY_CONTRACT,
    abi:     IDENTITY_ABI,
    functionName: 'isWhitelisted',
    args:    [address],
  });
}

export async function checkAlreadyPlayed(address: `0x${string}`): Promise<boolean> {
  return publicClient().readContract({
    address: WORDZAPPER_CONTRACT,
    abi:     WORDZAPPER_ABI,
    functionName: 'hasPlayedToday',
    args:    [address],
  });
}

export async function fetchPoolBalance(): Promise<bigint> {
  return publicClient().readContract({
    address:      WORDZAPPER_CONTRACT,
    abi:          WORDZAPPER_ABI,
    functionName: 'poolBalance',
  });
}

export async function fetchRemainingCap(): Promise<bigint> {
  return publicClient().readContract({
    address:      WORDZAPPER_CONTRACT,
    abi:          WORDZAPPER_ABI,
    functionName: 'remainingTodayCap',
  });
}

export function scoreTier(score: number): 1 | 2 | 3 {
  if (score >= 700) return 3;
  if (score >= 400) return 2;
  return 1;
}

function parseContractError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('NotCitizen'))       return 'Your wallet is not GoodDollar verified. Complete face verification first.';
  if (msg.includes('AlreadyPlayed'))    return 'You already claimed today. Come back tomorrow!';
  if (msg.includes('DailyCapReached'))  return 'Daily reward pool is full. Try again tomorrow.';
  if (msg.includes('InsufficientPool')) return 'Pool is empty. Let the team know at @WordZapper.';
  if (msg.includes('User rejected'))    return 'Transaction cancelled.';
  return 'Transaction failed. Check your wallet and try again.';
}

export async function claimOnChain(score: number): Promise<`0x${string}`> {
  const tier = scoreTier(score);
  const client = walletClient();
  const [account] = await client.getAddresses();

  try {
    return await client.writeContract({
      address:      WORDZAPPER_CONTRACT,
      abi:          WORDZAPPER_ABI,
      functionName: 'claimReward',
      args:         [BigInt(score), tier],
      account,
    });
  } catch (err) {
    throw new Error(parseContractError(err));
  }
}
