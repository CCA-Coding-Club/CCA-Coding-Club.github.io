/**
 * SolutionsPanel — displays member submissions for a challenge.
 * 
 * Fetches submissions from Firestore when mounted and renders
 * each member's attempts using MemberSubmissionGroup.
 * Includes a refresh button to pull latest submissions.
 * 
 * Used inside DetailPanel on the Challenges page.
 */
import { useEffect } from 'react';
import { useSubmissions } from '../hooks/useSubmissions';
import MemberSubmissionGroup from './MemberSubmissionGroup';
import { Loading, Empty, Error } from './LoadingSpinner';

export default function SolutionsPanel({ challengeId }) {
  const { submissions, codeMap, loading, error, refresh, fetchSubmissions } = useSubmissions(challengeId);

  // Fetch submissions when this panel first appears
  useEffect(() => {
    fetchSubmissions(null, true);
  }, []);

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
