
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';

// This is a simplified example. In a real app, you'd use a secure way to store service account keys.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Access token is required.' }, { status: 400 });
    }

    const cookieStore = cookies();

    // Store the access token in an HttpOnly cookie.
    cookieStore.set('google-access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600, // 1 hour
      path: '/',
    });
    
    // Store the refresh token securely if it exists.
    if (refreshToken) {
        cookieStore.set('google-refresh-token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 90, // 90 days
          path: '/',
        });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing access token:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
