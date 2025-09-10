
'use server';

import { google } from 'googleapis';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const oauthConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
};

const oauth2Client = new google.auth.OAuth2(
    oauthConfig.clientId,
    oauthConfig.clientSecret,
    oauthConfig.redirectUri
);

// Helper function to store tokens
const storeTokens = async (tokens: any) => {
    // In a real app, you'd want to store this per-user, but for this demo, we'll store it globally.
    const tokenDocRef = doc(db, 'googleApiTokens', 'driveTokens');
    await setDoc(tokenDocRef, tokens);
};

// Helper function to get tokens
const getTokens = async () => {
    const tokenDocRef = doc(db, 'googleApiTokens', 'driveTokens');
    const tokenDoc = await getDoc(tokenDocRef);
    if (tokenDoc.exists()) {
        return tokenDoc.data();
    }
    return null;
};

// Function to get an authenticated client
async function getAuthenticatedClient() {
    const tokens = await getTokens();
    if (tokens) {
        oauth2Client.setCredentials(tokens);
        // Check if the access token is expired and refresh it if necessary
        if (oauth2Client.isTokenExpiring()) {
            try {
                const { credentials } = await oauth2Client.refreshAccessToken();
                oauth2Client.setCredentials(credentials);
                await storeTokens(credentials);
            } catch (error) {
                console.error("Error refreshing access token, user needs to re-authenticate.", error);
                // By returning null, we force the re-authentication flow
                return null;
            }
        }
        return oauth2Client;
    }
    return null;
}

export async function getGoogleAuthUrl() {
    const scopes = ['https://www.googleapis.com/auth/drive.readonly'];
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // Force consent screen to get a refresh token
        scope: scopes,
    });
}

export async function setTokensFromCode(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await storeTokens(tokens);
}


export async function listFiles(parentFolderId: string, companyName: string): Promise<{ id: string; name: string; webViewLink: string; iconLink: string }[]> {
    const auth = await getAuthenticatedClient();
    if (!auth) {
        throw new Error("User is not authenticated with Google Drive.");
    }
    
    const drive = google.drive({ version: 'v3', auth });
    
    try {
        // 1. Find the company subfolder
        const folderQuery = `mimeType='application/vnd.google-apps.folder' and name='${companyName}' and '${parentFolderId}' in parents and trashed=false`;
        const folderRes = await drive.files.list({
            q: folderQuery,
            fields: 'files(id, name)',
            pageSize: 1,
        });

        if (!folderRes.data.files || folderRes.data.files.length === 0) {
            console.log(`No folder found with name "${companyName}" in parent folder.`);
            return [];
        }
        
        const companyFolderId = folderRes.data.files[0].id;
        if (!companyFolderId) {
             console.log(`Folder "${companyName}" has no ID.`);
             return [];
        }

        // 2. List files within that subfolder
        const fileQuery = `'${companyFolderId}' in parents and trashed=false`;
        const res = await drive.files.list({
            q: fileQuery,
            fields: 'files(id, name, webViewLink, iconLink)',
            pageSize: 100,
        });

        const files = res.data.files;
        if (files && files.length) {
            return files.map(file => ({
                id: file.id || '',
                name: file.name || 'Untitled',
                webViewLink: file.webViewLink || '',
                iconLink: file.iconLink || '',
            }));
        } else {
            return [];
        }
    } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
           console.log("Authentication error, user needs to re-authenticate.");
           throw new Error("Authentication required");
        }
        console.error('The API returned an error: ' + error);
        throw error;
    }
}
