
import { setTokensFromCode } from '@/services/google-drive-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        try {
            await setTokensFromCode(code);
            // Hardcode the redirect URL to ensure it works in the local dev environment.
            const redirectUrl = 'http://localhost:9002/dashboard/companies';
            return NextResponse.redirect(redirectUrl);
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            return new NextResponse('Authentication failed', { status: 500 });
        }
    } else {
        return new NextResponse('Missing authorization code', { status: 400 });
    }
}
