import { useState, useCallback } from 'react';
import { getSubmissions, getCodeBatch } from '../api/submissions';

export function useSubmissions(challengeId) {
  const [submissions, setSubmissions] = useState([]);
  const [codeMap, setCodeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCode, setLoadingCode] = useState(false);
  const [error, setError] = useState(null);
  
  // Firestore cursor tracking
  const [lastCursor, setLastCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchSubmissions = useCallback(async (cursor = null, isReset = false) => {
    if (!challengeId) return;
    
    if (isReset) setLoading(true);
    setError(null);

    try {
      // 1. Fetch metadata using the cursor
      const { data, nextCursor } = await getSubmissions(challengeId, cursor);
      
      setSubmissions(prev => isReset ? data : [...prev, ...data]);
      setLastCursor(nextCursor);
      setHasMore(nextCursor !== null);

      // 2. Extract all submission IDs from the history arrays
      const allIds = [];
      data.forEach(sub => {
        if (sub.submissionHistory) {
          sub.submissionHistory.forEach(history => {
            if (history.submissionId) {
              allIds.push(history.submissionId);
            }
          });
        }
      });

      // 3. Batch fetch code (the API handles the 30 queries chunk limit natively)
      if (allIds.length > 0) {
        setLoadingCode(true);
        const codeResults = await getCodeBatch(allIds);
        
        const newCodeMap = { ...codeMap };
        if (Array.isArray(codeResults)) {
          codeResults.forEach(item => {
            newCodeMap[item.submissionId] = item;
          });
        }
        setCodeMap(newCodeMap);
        setLoadingCode(false);
      }

    } catch (err) {
      setError(err.message || 'Failed to load submissions');
      setLoadingCode(false);
    } finally {
      setLoading(false);
    }
  }, [challengeId, codeMap]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchSubmissions(lastCursor, false);
    }
  }, [loading, hasMore, lastCursor, fetchSubmissions]);

  const refresh = useCallback(() => {
    setLastCursor(null);
    setCodeMap({});
    fetchSubmissions(null, true);
  }, [fetchSubmissions]);

  return { 
    submissions, 
    codeMap, 
    loading, 
    loadingCode, 
    error, 
    hasMore, 
    loadMore, 
    refresh,
    fetchSubmissions // Exported so ChallengesPage can trigger the first load
  };
}
