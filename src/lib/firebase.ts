'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC_Vd2Ttd3VwzefYCdTNLuO4Dk7KDESOE4",
  authDomain: "insights360-ta9hn.firebaseapp.com",
  projectId: "insights360-ta9hn",
  storageBucket: "insights360-ta9hn.firebasestorage.app",
  messagingSenderId: "249056251135",
  appId: "1:249056251135:web:016bba83b9d0d0150f50ca",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db);
  } catch (error) {
    if (error instanceof Error && error.name === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (error instanceof Error) {
      console.error('Error enabling Firestore persistence:', error.message);
    }
  }
}

export { app, db, auth };
