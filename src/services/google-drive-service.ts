
'use client';

import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, type UserCredential } from 'firebase/auth';

// This function initiates the sign-in redirect flow.
export async function signInWithGoogleDriveRedirect() {
  const provider = new GoogleAuthProvider();
  // Requesting read-only access to Google Drive files.
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  
  try {
    // This will redirect the user to the Google sign-in page.
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Redirect sign-in error:', error);
    // It's possible the redirect fails to initiate, so we throw the error.
    throw new Error('Could not start the Google sign-in process.');
  }
}

// This function handles the result after the user is redirected back to the app.
// It should be called when the page loads.
export async function handleGoogleDriveRedirectResult(): Promise<string | null> {
  try {
    const result: UserCredential | null = await getRedirectResult(auth);
    if (result) {
      // If the result exists, authentication was successful.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        return credential.accessToken;
      }
    }
    // If result is null, it means the page loaded without a redirect operation.
    return null;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    return null;
  }
}

// This function lists files from a specific folder in Google Drive.
export async function listFiles(accessToken: string, companyName: string, parentFolderId?: string): Promise<{ id: string; name: string; webViewLink: string; iconLink: string; }[]> {
    if (!parentFolderId) {
        console.warn("Google Drive Folder ID is not configured.");
        return [];
    }
    
    const driveApiEndpoint = 'https://www.googleapis.com/drive/v3/files';
    const headers = { 'Authorization': `Bearer ${accessToken}` };

    // 1. Find the company's subfolder within the main parent folder.
    const folderQuery = `mimeType='application/vnd.google-apps.folder' and name='${companyName}' and '${parentFolderId}' in parents and trashed=false`;
    const folderSearchUrl = `${driveApiEndpoint}?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)`;
    
    const folderRes = await fetch(folderSearchUrl, { headers });
    if (!folderRes.ok) {
        console.error("Error searching for company folder:", await folderRes.text());
        return [];
    }

    const folderData = await folderRes.json();
    if (!folderData.files || folderData.files.length === 0) {
        console.log(`No Google Drive folder found for company: ${companyName}`);
        return [];
    }
    const companyFolderId = folderData.files[0].id;

    // 2. List the files within that specific company folder.
    const fileQuery = `'${companyFolderId}' in parents and trashed=false`;
    const fileSearchUrl = `${driveApiEndpoint}?q=${encodeURIComponent(fileQuery)}&fields=files(id,name,webViewLink,iconLink)`;

    const filesRes = await fetch(fileSearchUrl, { headers });
    if (!filesRes.ok) {
        console.error("Error listing files:", await filesRes.text());
        return [];
    }
    const filesData = await filesRes.json();
    return filesData.files || [];
}
