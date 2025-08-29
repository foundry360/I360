
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Assessment } from '@/services/assessment-service';
import { GtmReadinessReport } from '@/components/gtm-readiness-report';
import { AppLayout } from '@/components/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button }from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const assessmentId = params.assessmentId as string;
    const [assessment, setAssessment] = React.useState<Assessment | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const reportRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!assessmentId) return;

        const fetchAssessment = async () => {
            try {
                setLoading(true);
                const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));

                if (assessmentDoc.exists()) {
                    setAssessment(assessmentDoc.data() as Assessment);
                } else {
                    setError('Assessment not found.');
                }
            } catch (err) {
                console.error("Error fetching assessment:", err);
                setError('Failed to load the assessment.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssessment();
    }, [assessmentId]);

    const handleExportClick = () => {
        const reportComponent = reportRef.current as any;
        if (reportComponent && typeof reportComponent.handlePrint === 'function') {
            reportComponent.handlePrint();
        } else {
            console.error("Export function not available on report component.");
        }
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="p-6 space-y-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </AppLayout>
        );
    }
    
    if (error) {
        return (
            <AppLayout>
                <div className="p-6 text-center">
                    <p className="text-destructive">{error}</p>
                     <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </AppLayout>
        );
    }

    if (!assessment || !assessment.result) {
         return (
            <AppLayout>
                <div className="p-6 text-center">
                    <p className="text-muted-foreground">Report data is not available for this assessment.</p>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button onClick={() => router.back()} variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{assessment.name}</h1>
                            <p className="text-muted-foreground">GTM Readiness Report</p>
                        </div>
                    </div>
                    <Button onClick={handleExportClick}>
                        <Download className="mr-2 h-4 w-4" />
                        Export to PDF
                    </Button>
                </div>
                <Separator />
                <GtmReadinessReport ref={reportRef} title={assessment.name} result={assessment.result} onComplete={() => router.back()} />
            </div>
        </AppLayout>
    );
}
