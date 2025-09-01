
import { PublicLayout } from '@/components/public-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function ThanksPage() {
    return (
        <PublicLayout>
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-4 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-2xl">Thank You!</CardTitle>
                        <CardDescription className="mt-2">
                            Your GTM Readiness Assessment has been successfully submitted. We will be in touch with you shortly with your detailed report.
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
