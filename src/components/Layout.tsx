import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function Layout() {
  const dark = useGameStore(s => s.dark);
  const hydrateDay = useGameStore(s => s.hydrateDay);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    hydrateDay();
  }, [hydrateDay]);

  return (
    <div className="app">
      <Outlet />
    </div>
  );
}
