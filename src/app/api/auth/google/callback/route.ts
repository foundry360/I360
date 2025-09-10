
import { setTokensFromCode } from '@/services/google-drive-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, protocol, host } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        try {
            await setTokensFromCode(code);
            // Redirect user back to the companies page after successful authentication.
            const redirectUrl = `${protocol}//${host}/dashboard/companies`;
            return NextResponse.redirect(redirectUrl);
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            return new NextResponse('Authentication failed', { status: 500 });
        }
    } else {
        return new NextResponse('Missing authorization code', { status: 400 });
    }
}
