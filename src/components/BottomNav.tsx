import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { path: '/',            icon: '🏠', label: 'Home' },
  { path: '/leaderboard', icon: '🏆', label: 'Ranks' },
  { path: '/claim',       icon: '💰', label: 'Claim' },
] as const;

export default function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV.map(({ path, icon, label }) => (
        <button
          key={path}
          className={`nav-item${pathname === path ? ' active' : ''}`}
          onClick={() => navigate(path)}
          aria-label={label}
        >
          <span className="nav-icon">{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}
