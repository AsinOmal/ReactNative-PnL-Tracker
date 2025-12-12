import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkRlRmjnAg9ygbA_Qm2f_XFWLA4fnxUqo",
  authDomain: "trading-pnl-tracker-13686.firebaseapp.com",
  projectId: "trading-pnl-tracker-13686",
  storageBucket: "trading-pnl-tracker-13686.firebasestorage.app",
  messagingSenderId: "910150341676",
  appId: "1:910150341676:web:388a90ec578e12e5ae2d89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
// Note: initializeAuth with persistence is preferred for RN but often causes issues with hot reload.
// Using getAuth() which typically handles state automatically.
let auth;
try {
  auth = getAuth(app);
} catch (e) {
    // If getAuth fails (rare), try initializeAuth without persistence or simple flow
    auth = initializeAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
