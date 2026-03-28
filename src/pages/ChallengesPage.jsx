import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChallenges } from '../hooks/useChallenges';
import { useSubmissions } from '../hooks/useSubmissions';
import ChallengeCard from '../components/ChallengeCard';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Loading, Empty, Error } from '../components/LoadingSpinner';
import '../styles/challenges.css';

export default function ChallengesPage() {
  const { challenges, loading, error, hasMore, loadMore } = useChallenges();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('challenge');
  const [showSolutions, setShowSolutions] = useState(false);

  const selected = challenges.find(c => c.challengeId === selectedId);

  function selectChallenge(id) {
    if (selectedId === id) {
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

      {/* Expanded challenge detail */}
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

/* ─── Detail Panel (expanded challenge) ─── */
function DetailPanel({ challenge, onClose, showSolutions, onToggleSolutions }) {
  const date = new Date(challenge.challengeCreation).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="challenge-detail">
      <div className="challenge-detail__top">
        <div>
          <h2 className="challenge-detail__title">{challenge.challengeName}</h2>
          <p className="challenge-detail__date">{date}</p>
        </div>
        <button className="challenge-detail__close" onClick={onClose}>✕</button>
      </div>

      <div className="challenge-detail__body">
        <MarkdownRenderer content={challenge.challengeDetails} />
      </div>

      <div className="actions-bar">
        <button
          className={`btn ${showSolutions ? 'btn--primary' : ''}`}
          onClick={onToggleSolutions}
        >
          {showSolutions ? 'Hide Solutions' : 'View Solutions'}
        </button>
      </div>

      {showSolutions && <SolutionsPanel challengeId={challenge.challengeId} />}
    </div>
  );
}

/* ─── Solutions Panel ─── */
function SolutionsPanel({ challengeId }) {
  const { submissions, codeMap, loading, error, refresh, fetchSubmissions } = useSubmissions(challengeId);

  // Fetch on mount
  useState(() => { fetchSubmissions(0); });

  if (loading && submissions.length === 0) return <Loading text="Loading submissions..." />;
  if (error) return <Error message={error} />;
  if (submissions.length === 0) return <Empty title="No submissions yet" description="Be the first to submit!" />;

  return (
    <div className="solutions">
      <div className="solutions__header">
        <h3>Solutions ({submissions.length})</h3>
        <button className="btn" onClick={refresh}>Refresh</button>
      </div>

      <div className="solutions__body">
        {submissions.map(sub => (
          <div className="member-group" key={sub.memberName}>
            <div className="member-group__name">
              {sub.memberName} — {sub.submissionHistory.length} attempt(s)
            </div>

            {sub.submissionHistory
              .sort((a, b) => b.attempt - a.attempt)
              .map(attempt => {
                const code = codeMap[attempt.submissionId];
                return (
                  <div className="attempt" key={attempt.submissionId}>
                    <div className="attempt__header">
                      <span>Attempt #{attempt.attempt}</span>
                      <span>{new Date(attempt.submissionDate).toLocaleDateString()}</span>
                    </div>
                    {code ? (
                      <SyntaxHighlighter
                        language={guessLang(code.submissionCode)}
                        style={oneDark}
                        customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem' }}
                        showLineNumbers
                      >
                        {code.submissionCode}
                      </SyntaxHighlighter>
                    ) : (
                      <p style={{ padding: '0.75rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        {loading ? 'Loading code...' : 'Code not available'}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Basic language guess for syntax highlighting */
function guessLang(code) {
  if (code.includes('#include') || code.includes('cout')) return 'cpp';
  if (code.includes('def ') || code.includes('print(')) return 'python';
  if (code.includes('console.log') || code.includes('const ')) return 'javascript';
  return 'text';
}
