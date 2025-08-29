
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
  linkWithCredential,
  OAuthProvider,
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
        prompt: 'consent', // This is important to ensure a refresh token is always sent
    });

    try {
        if (!auth.currentUser) {
            // This case handles initial sign-in if the user is not logged in.
             const result = await signInWithPopup(auth, provider);
             const credential = GoogleAuthProvider.credentialFromResult(result);
             if (credential) {
                await storeTokens(credential);
             }
             return result.user;
        } else {
            // This case handles linking the account if the user is already logged in.
            const credential = GoogleAuthProvider.credentialFromResult(await signInWithPopup(auth.currentUser, provider));

            if (!credential) {
                throw new Error("Could not get credential from Google sign-in.");
            }
            
            await storeTokens(credential);

            return auth.currentUser;
        }

    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("Sign-in popup closed by user.");
            return null;
        }
        if (error.code === 'auth/credential-already-in-use') {
            alert("This Google account is already associated with another user account.");
            return null;
        }
        console.error("An unhandled error occurred during Google sign-in:", error);
        throw error;
    }
};

async function storeTokens(credential: any) {
    const accessToken = credential.accessToken;
    // The refresh token is often not directly available on the credential object in the client.
    // It's primarily sent during the initial consent from the OAuth provider and should be handled server-side.
    // Our API route is set up to receive it if it's passed.
    const refreshToken = (credential as any).refreshToken || (credential.user?.toJSON() as any)?.stsTokenManager?.refreshToken;

    if (accessToken) {
        await fetch('/api/auth/store-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken, refreshToken }),
        });
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
