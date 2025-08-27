// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "insights360-ta9hn",
  "appId": "1:249056251135:web:016bba83b9d0d0150f50ca",
  "storageBucket": "insights360-ta9hn.firebasestorage.app",
  "apiKey": "AIzaSyC_Vd2Ttd3VwzefYCdTNLuO4Dk7KDESOE4",
  "authDomain": "insights360-ta9hn.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "249056251135"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
