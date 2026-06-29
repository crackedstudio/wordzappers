import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { prefetchAIPuzzle } from './lib/puzzles';

// Kick off AI puzzle generation in the background — no await, fails silently
prefetchAIPuzzle();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
