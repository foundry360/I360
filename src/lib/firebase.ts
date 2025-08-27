'use client';

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
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
let db: Firestore;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} else if (typeof window !== 'undefined') {
  app = getApp();
  db = getFirestore(app);
}


export { db };
