import { useState } from 'react';
import flourite from 'flourite';
import { useSearchParams } from 'react-router-dom';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';

SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c++', cpp);       // Flourite match
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('c#', csharp);     // Flourite match
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
  if (submissions.length === 0) return <Empty title="No submissions yet" description="Be the first to submit over the CCA Coding Club Discord!" />;

  return (
    <div className="solutions">
      <div className="solutions__header">
        <h3>Solutions ({submissions.length})</h3>
        <button className="btn" onClick={refresh}>Refresh</button>
      </div>

      <div className="solutions__body">
        {submissions.map(sub => (
          <MemberSubmissionGroup key={sub.memberName} sub={sub} codeMap={codeMap} loading={loading} />
        ))}
      </div>
    </div>
  );
}

/** Component to manage a single member's attempt pagination */
function MemberSubmissionGroup({ sub, codeMap, loading }) {
  const [attemptIdx, setAttemptIdx] = useState(0);

  // Sort history newest to oldest
  const history = [...sub.submissionHistory].sort((a, b) => b.attempt - a.attempt);

  const currentAttempt = history[attemptIdx];
  const code = currentAttempt ? codeMap[currentAttempt.submissionId] : null;

  return (
    <div className="member-group">
      <div className="member-group__name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{sub.memberName} — {history.length} attempt(s)</span>

        {/* Pagination Controls */}
        {history.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
            <button
              className="btn btn--secondary"
              style={{ padding: '0.2rem 0.5rem' }}
              disabled={attemptIdx === 0}
              onClick={() => setAttemptIdx(prev => prev - 1)}
            >
              ← Newer
            </button>
            <span style={{ color: 'var(--text-dim)' }}>
              {attemptIdx + 1} / {history.length}
            </span>
            <button
              className="btn btn--secondary"
              style={{ padding: '0.2rem 0.5rem' }}
              disabled={attemptIdx === history.length - 1}
              onClick={() => setAttemptIdx(prev => prev + 1)}
            >
              Older →
            </button>
          </div>
        )}
      </div>

      <div className="attempt">
        <div className="attempt__header">
          <span>Attempt #{currentAttempt.attempt}</span>
          <span>{new Date(currentAttempt.submissionDate).toLocaleDateString()}</span>
        </div>
        {code ? (
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: '0.2rem 0.6rem',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              background: 'rgba(255, 255, 255, 0.1)',
              borderBottomLeftRadius: 'var(--radius)',
              textTransform: 'uppercase',
              pointerEvents: 'none'
            }}>
              {guessLang(code.submissionCode)}
            </div>
            <SyntaxHighlighter
              language={guessLang(code.submissionCode)}
              style={oneDark}
              customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem' }}
              showLineNumbers
            >
              {code.submissionCode}
            </SyntaxHighlighter>
          </div>
        ) : (
          <p style={{ padding: '0.75rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            {loading ? 'Loading code...' : 'Code not available'}
          </p>
        )}
      </div>
    </div>
  );
}

/** Heuristic language guesser using Fluorite ML (this is light weight, only adds 6kb to bundle size) */
function guessLang(code) {
  try {
    const lang = flourite(code, { noUnknown: true }).language;
    if (lang === 'Unknown') return 'text'; //this is so that it doesn't crash the highlighter
    return lang.toLowerCase();
  } catch (e) {
    return 'text';
  }
}
