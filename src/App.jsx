import { HashRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import InfoPage from './pages/InfoPage';
import ChallengesPage from './pages/ChallengesPage';
import DevToolsPage from './pages/DevToolsPage';

export default function App() {
  return (
    <HashRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<InfoPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/dev" element={<DevToolsPage />} />
      </Routes>
    </HashRouter>
  );
}

