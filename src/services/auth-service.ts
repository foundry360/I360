
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
  signInWithRedirect,
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
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
  provider.addScope('https://www.googleapis.com/auth/documents.readonly');
  
  // This prompts the user to grant offline access, which is necessary to get a refresh token.
  provider.setCustomParameters({
    access_type: 'offline',
    prompt: 'consent', // Force consent screen to ensure refresh token is sent
  });
  
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Error during Google sign-in redirect:", error);
    throw error;
  }
};

export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      // The OAuthCredential contains the refresh token after a user grants offline access.
      const refreshToken = (credential as any)?.refreshToken;

      if (auth.currentUser && credential) {
          await linkWithCredential(auth.currentUser, credential);
      }

      if (accessToken) {
        await fetch('/api/auth/store-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
      }

      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      
      return result.user;
    }
    return null;
  } catch(error: any) {
    console.error("Error getting redirect result:", error);
    if (error.code === 'auth/credential-already-in-use') {
        alert("This Google account is already associated with another user.");
    }
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
