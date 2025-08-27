import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'insights360-ta9hn',
  appId: '1:249056251135:web:016bba83b9d0d0150f50ca',
  storageBucket: 'insights360-ta9hn.firebasestorage.app',
  apiKey: 'AIzaSyC_Vd2Ttd3VwzefYCdTNLuO4Dk7KDESOE4',
  authDomain: 'insights360-ta9hn.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '249056251135',
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
