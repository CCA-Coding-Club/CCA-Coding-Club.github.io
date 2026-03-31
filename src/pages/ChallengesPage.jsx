/**
 * ChallengesPage — the main challenges listing page.
 * 
 * Shows a grid of challenge cards. Clicking a card expands a DetailPanel
 * above the grid with the full challenge info and solutions.
 * 
 * The selected challenge is tracked via URL query param (?challenge=id)
 * so links are shareable.
 */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChallenges } from '../hooks/useChallenges';
import ChallengeCard from '../components/ChallengeCard';
import DetailPanel from '../components/DetailPanel';
import { Loading, Empty, Error } from '../components/LoadingSpinner';
import '../styles/challenges.css';

export default function ChallengesPage() {
  const { challenges, loading, error, hasMore, loadMore } = useChallenges();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('challenge');
  const [showSolutions, setShowSolutions] = useState(false);

  // Find the full challenge object that matches the URL param
  const selected = challenges.find(c => c.challengeId === selectedId);

  function selectChallenge(id) {
    if (selectedId === id) {
      // Clicking the same card again closes the detail panel
      setSearchParams({});
      setShowSolutions(false);
    } else {
      setSearchParams({ challenge: id });
      setShowSolutions(false);
    }
  }

  return (
    <main className="challenges-page">
      <h1>Coding Challenges</h1>
      <p>Coding challenges hosted by Alex and Weston</p>

      {error && <Error message={error} />}

      {/* Expanded challenge detail (shows above the grid when a card is selected) */}
      {selected && (
        <DetailPanel
          challenge={selected}
          onClose={() => { setSearchParams({}); setShowSolutions(false); }}
          showSolutions={showSolutions}
          onToggleSolutions={() => setShowSolutions(!showSolutions)}
        />
      )}

      {/* Challenge cards grid */}
      <div className="challenges-grid">
        {loading && challenges.length === 0 ? (
          <Loading text="Loading challenges..." />
        ) : challenges.length === 0 ? (
          <Empty title="No challenges yet" description="Check back soon!" />
        ) : (
          challenges.map(c => (
            <ChallengeCard
              key={c.challengeId}
              challenge={c}
              isActive={selectedId === c.challengeId}
              onClick={() => selectChallenge(c.challengeId)}
            />
          ))
        )}
      </div>

      {hasMore && (
        <div className="load-more">
          <button className="btn" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </main>
  );
}
