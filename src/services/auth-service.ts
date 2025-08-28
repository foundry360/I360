
'use client';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

// For this prototype, we'll auto-create a user if they don't exist.
export const signIn = async (email: string, password: string) => {
  try {
    // First, try to sign in the user.
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // If the user is not found, create a new account.
    if (error.code === 'auth/user-not-found') {
      try {
        return await createUserWithEmailAndPassword(auth, email, password);
      } catch (createError) {
        // Handle errors during account creation.
        console.error("Error creating user:", createError);
        throw createError;
      }
    } else {
      // For any other sign-in error, re-throw it to be handled by the UI.
      console.error("Error signing in:", error);
      throw error;
    }
  }
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const onAuthStateChangeObserver = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
