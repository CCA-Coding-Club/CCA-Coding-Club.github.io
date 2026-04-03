/**
 * MemberSubmissionGroup — shows one member's attempts for a challenge.
 * 
 * Displays the member name, attempt count, and pagination controls
 * to navigate between their older/newer attempts.
 * Uses CodeBlock to render syntax-highlighted code.
 * 
 * Used inside SolutionsPanel.
 */
import { useState } from 'react';
import CodeBlock from './CodeBlock';

export default function MemberSubmissionGroup({ sub, codeMap, loading }) {
  const [attemptIdx, setAttemptIdx] = useState(0);

  // Sort history newest to oldest
  const history = [...sub.submissionHistory].sort((a, b) => b.attempt - a.attempt);

  const currentAttempt = history[attemptIdx];
  const code = currentAttempt ? codeMap[currentAttempt.submissionId] : null;

  return (
    <div className="member-group">
      <div className="member-group__header">
        <span>{sub.memberName} — {history.length} attempt(s)</span>

        {/* Pagination: only shows if member has multiple attempts */}
        {history.length > 1 && (
          <div className="member-group__pagination">
            <button
              className="btn btn--small"
              disabled={attemptIdx === 0}
              onClick={() => setAttemptIdx(prev => prev - 1)}
            >
              ← Newer
            </button>
            <span className="member-group__page-info">
              {attemptIdx + 1} / {history.length}
            </span>
            <button
              className="btn btn--small"
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
          <CodeBlock code={code.submissionCode} />
        ) : (
          <p className="attempt__placeholder">
            {loading ? 'Loading code...' : 'Code not available'}
          </p>
        )}
      </div>
    </div>
  );
}
