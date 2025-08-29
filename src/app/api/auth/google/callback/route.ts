
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';
import { auth as clientAuth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
} catch (e) {
    console.error('Failed to initialize Firebase Admin SDK:', e);
}


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/profile?error=Missing-Code', request.url));
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const cookieStore = cookies();
        if (tokens.access_token) {
            cookieStore.set('google-access-token', tokens.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: tokens.expiry_date ? (tokens.expiry_date - Date.now()) / 1000 : 3600,
                path: '/',
            });
        }
        if (tokens.refresh_token) {
            cookieStore.set('google-refresh-token', tokens.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 90, // 90 days
                path: '/',
            });
        }
        
        if (tokens.id_token && clientAuth.currentUser) {
            const credential = GoogleAuthProvider.credential(tokens.id_token);
            // This links the Google account to the existing Firebase user
            await clientAuth.currentUser.linkWithCredential(credential);
        } else if (!clientAuth.currentUser) {
            console.warn("No Firebase user logged in on the client to link the Google account to.");
        }


        // Redirect user back to their profile page
        const companyId = cookieStore.get('companyId')?.value || 'acme-inc'; // Or get from session
        return NextResponse.redirect(new URL(`/${companyId}/profile`, request.url));

    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        return NextResponse.redirect(new URL('/profile?error=Token-Exchange-Failed', request.url));
    }
}
