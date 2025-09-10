
'use client';

import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, type AuthProvider, type User } from 'firebase/auth';

// This function initiates the sign-in process and requests the necessary Google Drive scopes.
async function getDriveAccessToken(): Promise<string | null> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');

    try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        return credential?.accessToken || null;
    } catch (error) {
        console.error("Google sign-in error:", error);
        return null;
    }
}

// This function lists files from Google Drive using the access token.
export async function listFiles(parentFolderId: string, companyName: string): Promise<{ id: string; name: string; webViewLink: string; iconLink: string; }[] | null> {
    const accessToken = await getDriveAccessToken();
    if (!accessToken) {
        return null; // Indicates authentication failed or was cancelled.
    }
    
    const driveApiEndpoint = 'https://www.googleapis.com/drive/v3/files';

    // 1. Find the company subfolder within the parent folder
    const folderQuery = `mimeType='application/vnd.google-apps.folder' and name='${companyName}' and '${parentFolderId}' in parents and trashed=false`;
    const folderSearchUrl = `${driveApiEndpoint}?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)`;

    const folderRes = await fetch(folderSearchUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!folderRes.ok) {
        console.error("Error searching for company folder:", await folderRes.text());
        return [];
    }

    const folderData = await folderRes.json();
    if (!folderData.files || folderData.files.length === 0) {
        console.log(`No folder found for company: ${companyName}`);
        return []; // No folder found, so no files to list.
    }
    
    const companyFolderId = folderData.files[0].id;

    // 2. List files within that company subfolder
    const fileQuery = `'${companyFolderId}' in parents and trashed=false`;
    const fileSearchUrl = `${driveApiEndpoint}?q=${encodeURIComponent(fileQuery)}&fields=files(id,name,webViewLink,iconLink)`;

    const filesRes = await fetch(fileSearchUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!filesRes.ok) {
        console.error("Error listing files:", await filesRes.text());
        return [];
    }

    const filesData = await filesRes.json();
    return filesData.files || [];
}
