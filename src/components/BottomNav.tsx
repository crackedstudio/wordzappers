import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Trophy, Coins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const NAV: { path: string; Icon: LucideIcon; label: string }[] = [
  { path: '/',            Icon: Home,   label: 'Home'  },
  { path: '/leaderboard', Icon: Trophy, label: 'Ranks' },
  { path: '/claim',       Icon: Coins,  label: 'Claim' },
];

export default function BottomNav() {
  const navigate      = useNavigate();
  const { pathname }  = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV.map(({ path, Icon, label }) => (
        <button
          key={path}
          className={`nav-item${pathname === path ? ' active' : ''}`}
          onClick={() => navigate(path)}
          aria-label={label}
        >
          <span className="nav-icon"><Icon size={22} strokeWidth={1.8} /></span>
          {label}
        </button>
      ))}
    </nav>
  );
}
