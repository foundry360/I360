
import { setTokensFromCode } from '@/services/google-drive-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const companyId = searchParams.get('state'); // Retrieve companyId from state

    if (code) {
        try {
            await setTokensFromCode(code);
            // Redirect back to the specific company page with a status parameter
            if (companyId) {
                const redirectUrl = new URL(`/dashboard/companies/${companyId}/details?authed=true`, request.url);
                redirectUrl.searchParams.set('authed', 'true');
                return NextResponse.redirect(redirectUrl);
            } else {
                 // Fallback if state is missing
                const redirectUrl = new URL('/dashboard/companies', request.url);
                return NextResponse.redirect(redirectUrl);
            }

        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            return new NextResponse('Authentication failed', { status: 500 });
        }
    } else {
        return new NextResponse('Missing authorization code', { status: 400 });
    }
}
