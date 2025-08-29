
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('google-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'User is not authenticated with Google. Please connect your Google account from the profile page.' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.list({
      pageSize: 25,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
    });

    return NextResponse.json({ files: response.data.files });

  } catch (error: any) {
    console.error('Error fetching Google Drive files:', error);
     // Check if the error is due to an invalid token (which could mean it's expired)
    if (error.response?.data?.error === 'invalid_grant') {
        // Clear the expired cookie
        cookies().delete('google-access-token');
        return NextResponse.json({ error: 'Your Google authentication has expired. Please disconnect and reconnect your Google account from the profile page.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An error occurred while fetching files from Google Drive.' }, { status: 500 });
  }
}
