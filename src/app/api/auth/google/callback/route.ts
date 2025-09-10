
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
                // Using a relative path is more robust for redirects.
                return NextResponse.redirect(`/dashboard/companies/${companyId}/details?authed=true`);
            } else {
                 // Fallback if state is missing
                return NextResponse.redirect('/dashboard/companies');
            }

        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            return new NextResponse('Authentication failed', { status: 500 });
        }
    } else {
        return new NextResponse('Missing authorization code', { status: 400 });
    }
}
