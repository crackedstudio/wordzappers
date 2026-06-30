import { useGameStore } from '../store/gameStore';
import Connect from '../pages/Connect';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const walletAddress = useGameStore(s => s.walletAddress);
  if (!walletAddress) return <Connect />;
  return <>{children}</>;
}
