import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
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
// We need to use getReactNativePersistence to ensure login persists across reloads
// We try initializeAuth first; if it throws (e.g. already initialized), we use getAuth
import AsyncStorage from '@react-native-async-storage/async-storage';

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // Parsing check or already initialized
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
