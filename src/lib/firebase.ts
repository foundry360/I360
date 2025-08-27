'use client';

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'insights360-ta9hn',
  appId: '1:249056251135:web:016bba83b9d0d0150f50ca',
  storageBucket: 'insights360-ta9hn.firebasestorage.app',
  apiKey: 'AIzaSyC_Vd2Ttd3VwzefYCdTNLuO4Dk7KDESOE4',
  authDomain: 'insights360-ta9hn.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '249056251135',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}


export { app, db, auth };
