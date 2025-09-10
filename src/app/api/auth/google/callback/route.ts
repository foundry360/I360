
import { setTokensFromCode } from '@/services/google-drive-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const companyId = searchParams.get('state'); // Retrieve companyId from state

    if (code) {
        try {
            await setTokensFromCode(code);
            
            const baseUrl = new URL(request.url).origin;
            let redirectUrl;

            if (companyId) {
                redirectUrl = new URL(`/dashboard/companies/${companyId}/details?authed=true`, baseUrl);
            } else {
                 // Fallback if state is missing
                redirectUrl = new URL('/dashboard/companies', baseUrl);
            }
            return NextResponse.redirect(redirectUrl.toString());

        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            return new NextResponse('Authentication failed', { status: 500 });
        }
    } else {
        return new NextResponse('Missing authorization code', { status: 400 });
    }
}
