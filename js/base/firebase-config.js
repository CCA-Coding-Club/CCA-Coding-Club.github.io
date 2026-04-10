/*
 * firebase-config.js — Connect to our Firebase database.
 *
 * These credentials are safe to be public. Security is handled
 * by Firestore security rules, not by hiding these values.
 *
 * After this script runs, a global variable called "db" is 
 * available in any script loaded after this one.
 */

firebase.initializeApp({
  apiKey: "AIzaSyApqYYaArzh4nLQFMLSv6Avd5KWw7FIad8",
  authDomain: "ccacodingclubwebsite.firebaseapp.com",
  projectId: "ccacodingclubwebsite",
  storageBucket: "ccacodingclubwebsite.firebasestorage.app",
  messagingSenderId: "621383915729",
  appId: "1:621383915729:web:7fc37918ea63fa58dc4df0",
});

// "db" is the Firestore database — use it in other scripts to read/write data
var db = firebase.firestore();
