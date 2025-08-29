
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    let accessToken = cookieStore.get('google-access-token')?.value;
    const refreshToken = cookieStore.get('google-refresh-token')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: 'User is not authenticated with Google. Please connect your Google account from the profile page.' }, { status: 401 });
    }
    
    const oauth2Client = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // This should be your Google Client ID
        process.env.GOOGLE_CLIENT_SECRET, // This should be your Google Client Secret
        undefined // Redirect URI is not needed for server-side calls
    );

    oauth2Client.setCredentials({ 
        access_token: accessToken,
        refresh_token: refreshToken
    });

    // Handle token expiration
    const isTokenExpired = !accessToken || new Date() >= (await oauth2Client.getTokenInfo(accessToken)).expiry_date - 60000;

    if (isTokenExpired && refreshToken) {
        try {
            const { tokens } = await oauth2Client.refreshAccessToken();
            accessToken = tokens.access_token;
            
            if (!accessToken) {
              throw new Error("Failed to refresh access token.");
            }

            oauth2Clien.setCredentials(tokens);

            // Update the cookie with the new access token
            cookieStore.set('google-access-token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: tokens.expiry_date ? (tokens.expiry_date - Date.now()) / 1000 : 3600,
                path: '/',
            });
        } catch(refreshError) {
             console.error('Error refreshing access token:', refreshError);
             cookies().delete('google-access-token');
             cookies().delete('google-refresh-token');
             return NextResponse.json({ error: 'Your Google authentication has expired. Please disconnect and reconnect your Google account from the profile page.' }, { status: 401 });
        }
    }


    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.list({
      pageSize: 25,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
    });

    return NextResponse.json({ files: response.data.files });

  } catch (error: any) {
    console.error('Error fetching Google Drive files:', error);
    if (error.response?.data?.error === 'invalid_grant' || error.message.includes('token')) {
        cookies().delete('google-access-token');
        cookies().delete('google-refresh-token');
        return NextResponse.json({ error: 'Your Google authentication has expired. Please disconnect and reconnect your Google account from the profile page.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An error occurred while fetching files from Google Drive.' }, { status: 500 });
  }
}
