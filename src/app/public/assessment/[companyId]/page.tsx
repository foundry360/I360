
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { getCompany } from '@/services/company-service';
import type { Company } from '@/services/company-service';
import { PublicLayout } from '@/components/public-layout';
import { PublicGtmForm } from '@/components/public-assessment-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function PublicAssessmentPage() {
    const params = useParams();
    const companyId = params.companyId as string;
    const [company, setCompany] = React.useState<Company | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!companyId) {
            setError("No company ID provided in the link.");
            setLoading(false);
            return;
        };

        const fetchCompany = async () => {
            try {
                setLoading(true);
                const companyData = await getCompany(companyId);
                if (companyData) {
                    setCompany(companyData);
                } else {
                    setError('The company specified in the link could not be found.');
                }
            } catch (err) {
                console.error("Error fetching company:", err);
                setError('An error occurred while loading the company information.');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [companyId]);

    if (loading) {
        return (
            <PublicLayout>
                 <div className="p-6 space-y-4 max-w-4xl mx-auto">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="space-y-6 pt-8">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </PublicLayout>
        );
    }

    if (error) {
        return (
            <PublicLayout>
                <div className="p-6 max-w-4xl mx-auto">
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            </PublicLayout>
        );
    }
    
    if (!company) {
         return (
            <PublicLayout>
                <div className="p-6 max-w-4xl mx-auto">
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Company data is unavailable.</AlertDescription>
                    </Alert>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto">
                <PublicGtmForm companyId={company.id} companyName={company.name} />
            </div>
        </PublicLayout>
    );
}
