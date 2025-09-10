
import { setTokensFromCode } from '@/services/google-drive-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        try {
            await setTokensFromCode(code);
            // Redirect user back to the company details page they were on.
            // For simplicity, we'll redirect to the main companies page.
            return NextResponse.redirect(new URL('/dashboard/companies', request.url));
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            return new NextResponse('Authentication failed', { status: 500 });
        }
    } else {
        return new NextResponse('Missing authorization code', { status: 400 });
    }
}
