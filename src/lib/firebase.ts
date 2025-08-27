import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase-app';

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
