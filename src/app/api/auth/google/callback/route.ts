
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL(`/dashboard/profile?error=Missing-Code`, request.url));
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!redirectUri) {
        throw new Error('GOOGLE_REDIRECT_URI is not defined in .env file');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
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

        // Redirect user back to a stable dashboard or profile page
        // The app router will handle getting them to the right company context.
        return NextResponse.redirect(new URL(`/dashboard`, request.url));

    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        return NextResponse.redirect(new URL(`/dashboard?error=Token-Exchange-Failed`, request.url));
    }
}
