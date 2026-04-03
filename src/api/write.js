import { doc, collection, query, orderBy, limit, getDocs, writeBatch, arrayUnion } from 'firebase/firestore';
import { db } from './config';

/**
 * ── ID CONVENTIONS ──
 * 
 * These write functions enforce the linking between all 3 collections:
 * 
 *   Challenges           → doc ID = challengeId (auto-incremented: challenge-001, challenge-002, ...)
 *   ChallengeSubmissions → doc ID = "{challengeId}_{memberName}"
 *   ChallengeSubmissionsCode → doc ID = auto-generated (this IS the submissionId)
 * 
 * The batch ensures both the code doc and the submission history entry
 * are created atomically — either both exist or neither does.
 * 
 * All dates are stored as ISO 8601 strings for clean round-tripping
 * between Firestore and the client (no Timestamp conversion needed).
 */

/**
 * Generate the next challengeId by finding the highest existing number.
 * e.g. if "challenge-003" is the latest, returns "challenge-004".
 */
async function getNextChallengeId() {
  const challengesRef = collection(db, 'Challenges');
  const q = query(challengesRef, orderBy('challengeId', 'desc'), limit(1));
  const snapshot = await getDocs(q);

  let nextNum = 1;
  if (!snapshot.empty) {
    const lastId = snapshot.docs[0].data().challengeId; // "challenge-003"
    const lastNum = parseInt(lastId.split('-').pop(), 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `challenge-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Create a new challenge with an auto-generated challengeId.
 * The ID auto-increments (challenge-001, challenge-002, ...) for readable URLs.
 * 
 * @param {Object} data - Challenge fields: challengeName, challengeDescription, challengeDetails
 * @returns {string} The generated challengeId
 */
export async function createChallenge({ challengeName, challengeDescription, challengeDetails }) {
  const challengeId = await getNextChallengeId();
  const challengeRef = doc(db, 'Challenges', challengeId);

  const batch = writeBatch(db);

  batch.set(challengeRef, {
    challengeId,
    challengeName,
    challengeDescription,
    challengeDetails,
    challengeCreation: new Date().toISOString(),
  });

  await batch.commit();
  return challengeId;
}

/**
 * Submit a solution for a challenge.
 * 
 * How IDs stay linked:
 *   1. A code doc ID is generated up front — this IS the submissionId
 *   2. That same submissionId is written into the member's submissionHistory array
 *   3. Both writes happen in a single batch — all or nothing
 * 
 * @param {string} challengeId - The challenge being solved
 * @param {string} memberName - The member submitting
 * @param {string} code - The submitted code string
 * @param {number} attemptNumber - Which attempt this is (1, 2, 3, ...)
 */
export async function submitSolution(challengeId, memberName, code, attemptNumber) {
  const batch = writeBatch(db);

  // 1. Generate the code doc ref — its auto-ID becomes the submissionId
  const codeRef = doc(collection(db, 'ChallengeSubmissionsCode'));
  const submissionId = codeRef.id;
  const now = new Date().toISOString();

  // 2. Write the code document
  batch.set(codeRef, {
    submissionId,
    submissionDate: now,
    submissionCode: code,
  });

  // 3. Upsert the member's submission doc using a deterministic compound ID
  //    This guarantees one doc per member per challenge — no duplicates
  const subRef = doc(db, 'ChallengeSubmissions', `${challengeId}_${memberName}`);

  batch.set(subRef, {
    challengeId,
    memberName,
    lastActivityDate: now,
    submissionHistory: arrayUnion({
      attempt: attemptNumber,
      submissionDate: now,
      submissionId,
    }),
  }, { merge: true });

  // 4. Atomic commit — both docs succeed or both fail
  await batch.commit();

  return { submissionId };
}
