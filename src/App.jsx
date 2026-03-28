import { HashRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import InfoPage from './pages/InfoPage';
import ChallengesPage from './pages/ChallengesPage';

export default function App() {
  return (
    <HashRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<InfoPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
      </Routes>
    </HashRouter>
  );
}
