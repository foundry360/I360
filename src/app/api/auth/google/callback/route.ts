
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        // Redirect to a stable error page if code is missing
        const errorUrl = new URL(`/dashboard/profile`, request.url);
        errorUrl.searchParams.set('error', 'Missing authorization code.');
        return NextResponse.redirect(errorUrl);
    }

    // Use the exact redirect URI from environment variables
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!redirectUri) {
        console.error('GOOGLE_REDIRECT_URI is not defined in .env file');
        // Return a server error response
        return new NextResponse('Server configuration error.', { status: 500 });
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
        const errorUrl = new URL(`/dashboard/profile`, request.url);
        errorUrl.searchParams.set('error', 'Token exchange failed.');
        return NextResponse.redirect(errorUrl);
    }
}
