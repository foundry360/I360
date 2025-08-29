
'use client';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  linkWithCredential,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const signIn = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // If user not found, create a new user.
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set a default display name if none is provided
        await updateProfile(userCredential.user, { displayName: email.split('@')[0] });
        return userCredential;
      } catch (createError: any) {
        console.error('Error creating user:', createError);
        throw createError;
      }
    }
    
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.setCustomParameters({
    access_type: 'offline',
    prompt: 'consent',
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential) {
        throw new Error("Could not get credential from Google sign-in.");
    }
      
    const accessToken = credential.accessToken;
    const refreshToken = (credential as any).refreshToken || (result.user.toJSON() as any).stsTokenManager.refreshToken;


    if (auth.currentUser && auth.currentUser.uid !== result.user.uid) {
        // This case handles linking a Google account to an already logged-in user.
        // But signInWithPopup creates a new session, so we need to be careful.
        // For simplicity, we'll assume the user intends to sign in with this Google account.
        // A more complex app might handle merging accounts.
        console.warn("Signed in with a different Google account. The app will proceed with the new account.");
    }

    if (accessToken) {
      await fetch('/api/auth/store-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken }),
      });
    }

    // Reload the user to get the updated provider data
    if (auth.currentUser) {
      await auth.currentUser.reload();
    }
    
    return result.user;

  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup closed by user.");
        return null;
    }
    if (error.code === 'auth/credential-already-in-use') {
       alert("This Google account is already associated with another user account.");
       return null;
    }
    console.error("Error during Google sign-in:", error);
    throw error;
  }
};


export const handleGoogleRedirectResult = async () => {
  // This function is kept for potential future use with other redirect-based providers,
  // but is no longer central to the Google Sign-In flow.
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Handled redirect result.", result);
    }
    return result;
  } catch(error: any) {
    console.error("Error getting redirect result:", error);
    return null;
  }
}


export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const onAuthStateChangeObserver = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};


export const updateUserProfile = async (
  user: User,
  updates: { displayName?: string; photoFile?: File }
) => {
  let photoURL = user.photoURL;

  if (updates.photoFile) {
    const storage = getStorage();
    const storageRef = ref(storage, `avatars/${user.uid}/${updates.photoFile.name}`);
    const snapshot = await uploadBytes(storageRef, updates.photoFile);
    photoURL = await getDownloadURL(snapshot.ref);
  }

  await updateProfile(user, {
    displayName: updates.displayName,
    photoURL: photoURL,
  });
};
