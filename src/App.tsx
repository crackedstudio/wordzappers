import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tutorial from './pages/Tutorial';
import Game from './pages/Game';
import Result from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import Claim from './pages/Claim';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,          element: <Home /> },
      { path: 'tutorial',     element: <Tutorial /> },
      { path: 'game',         element: <Game /> },
      { path: 'result',       element: <Result /> },
      { path: 'leaderboard',  element: <Leaderboard /> },
      { path: 'claim',        element: <Claim /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
