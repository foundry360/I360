
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { getCompany } from '@/services/company-service';
import type { Company } from '@/services/company-service';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicLayout } from '@/components/public-layout';
import { PublicGtmForm } from '@/components/public-assessment-form';
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
            setError('No company ID provided.');
            setLoading(false);
            return;
        }

        const fetchCompany = async () => {
            try {
                setLoading(true);
                const companyData = await getCompany(companyId);
                if (companyData) {
                    setCompany(companyData);
                } else {
                    setError('Company not found. Please check the link.');
                }
            } catch (err) {
                console.error("Error fetching company:", err);
                setError('Failed to load company information. The link may be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [companyId]);

    if (loading) {
        return (
            <PublicLayout>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </PublicLayout>
        );
    }

    if (error || !company) {
        return (
            <PublicLayout>
                <div className="flex items-center justify-center h-full">
                    <Alert variant="destructive" className="max-w-lg">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          {error || 'An unknown error occurred while trying to load the assessment.'}
                        </AlertDescription>
                    </Alert>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
           <PublicGtmForm companyId={company.id} companyName={company.name} />
        </PublicLayout>
    );
}
