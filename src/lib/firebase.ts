'use client';

import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase-app'; // Import the initialized app

// Get Firestore and Auth instances
const db = getFirestore(app);
const auth = getAuth(app);

try {
    enableIndexedDbPersistence(db);
} catch (error) {
    if (error instanceof Error && error.name === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (error instanceof Error) {
        console.error('Error enabling Firestore persistence:', error.message);
    }
}

export { db, auth };
