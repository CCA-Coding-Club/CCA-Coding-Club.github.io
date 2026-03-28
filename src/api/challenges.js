import { collection, doc, query, orderBy, limit, getDocs, getDoc, startAfter } from 'firebase/firestore';
import { db, USE_MOCK } from './config';
import { mockChallenges } from './mockData';

const PAGE_SIZE = 10;

/**
 * Fetch a paginated list of challenges.
 * Uses Firebase Admin/Firestore logic structure.
 * 
 * @param {Object} lastVisibleDoc - The Firestore document snapshot from the previous page. Null for page 1.
 */
export async function getChallenges(lastVisibleDoc = null) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return { data: mockChallenges, nextCursor: null };
  }

  const challengesRef = collection(db, "Challenges");
  
  let q;
  if (lastVisibleDoc) {
    q = query(challengesRef, orderBy("challengeCreation", "desc"), startAfter(lastVisibleDoc), limit(PAGE_SIZE));
  } else {
    q = query(challengesRef, orderBy("challengeCreation", "desc"), limit(PAGE_SIZE));
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
 * Fetch a single challenge by its ID.
 */
export async function getChallengeById(id) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    return mockChallenges.find(c => c.challengeId === id) || null;
  }

  const docRef = doc(db, "Challenges", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  
  return null;
}
