import { useState, useEffect, useCallback } from 'react';
import { getChallenges } from '../api/challenges';

export function useChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track Firestore cursor instead of numerical page index
  const [lastCursor, setLastCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Fetch challenges on first mount
  useEffect(() => {
    fetchChallenges(null, true);
  }, []);

  async function fetchChallenges(cursor = null, isReset = false) {
    if (isReset) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, nextCursor } = await getChallenges(cursor);
      
      setChallenges(prev => isReset ? data : [...prev, ...data]);
      setLastCursor(nextCursor);
      setHasMore(nextCursor !== null);
      
    } catch (err) {
      setError(err.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchChallenges(lastCursor, false);
    }
  }, [loading, hasMore, lastCursor]);

  const refresh = useCallback(() => {
    setLastCursor(null);
    fetchChallenges(null, true);
  }, []);

  return { challenges, loading, error, hasMore, loadMore, refresh };
}
