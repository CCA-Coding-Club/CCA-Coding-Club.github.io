/**
 * Submissions READ module.
 * 
 * ID conventions:
 *   ChallengeSubmissions    → doc ID = "{challengeId}_{memberName}"
 *   ChallengeSubmissionsCode → doc ID = submissionId (auto-generated string)
 * 
 * submissionHistory[].submissionId links to ChallengeSubmissionsCode doc IDs.
 * See write.js for how these are created atomically.
 */
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from './config';

const PAGE_SIZE = 15;

/**
 * Fetch submissions metadata for a given challenge, paginated and sorted by activity.
 * 
 * @param {string} challengeId 
 * @param {Object} lastVisibleDoc - The last document snapshot from the previous query
 */
export async function getSubmissions(challengeId, lastVisibleDoc = null) {
  const submissionsRef = collection(db, "ChallengeSubmissions");
  
  let q;
  if (lastVisibleDoc) {
    q = query(
      submissionsRef,
      where("challengeId", "==", challengeId),
      orderBy("lastActivityDate", "desc"),
      startAfter(lastVisibleDoc),
      limit(PAGE_SIZE)
    );
  } else {
    q = query(
      submissionsRef,
      where("challengeId", "==", challengeId),
      orderBy("lastActivityDate", "desc"),
      limit(PAGE_SIZE)
    );
  }

  const snapshot = await getDocs(q);
  
  const data = [];
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });

  const nextCursor = snapshot.docs.length === PAGE_SIZE ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { data, nextCursor };
}

/**
 * Chunk an array into smaller arrays of a specified size
 */
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Fetch exact strings of code for a specific list of submission IDs.
 * Automatically chunks the request into batches of 30 to bypass Firestore's "in" limit.
 * 
 * @param {Array<string|number>} submissionIds 
 */
export async function getCodeBatch(submissionIds) {
  if (!submissionIds || submissionIds.length === 0) return [];

  // Firestore "in" queries max out at 30 items. We must split arrays larger than 30.
  const chunks = chunkArray(submissionIds, 30);
  const codeRef = collection(db, "ChallengeSubmissionsCode");

  // Fire off all chunked queries simultaneously
  const fetchPromises = chunks.map(async (chunk) => {
    const q = query(codeRef, where("submissionId", "in", chunk));
    const snapshot = await getDocs(q);
    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  });

  const chunkedResults = await Promise.all(fetchPromises);
  
  // Flatten array of arrays back into a single array
  return chunkedResults.flat();
}
