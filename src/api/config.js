import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Fall back to Mock Data if the API key hasn't been added yet
export const USE_MOCK = !firebaseConfig.apiKey;

let app;
let db;

if (!USE_MOCK) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("[Firebase] Initialized successfully");
  } catch (error) {
    console.error("[Firebase] Initialization error:", error);
  }
} else {
  console.log("[Firebase] No API config found. Running in MOCK Mode.");
}

export { db };
