'use client';

import { useState } from 'react';
import { type z } from 'zod';
import { QuestionnaireForm, type formSchema } from '@/components/questionnaire-form';
import { ReportDisplay } from '@/components/report-display';
import { getAnalysis, type AnalysisResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RevOpsAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAnalysisResult(null);
    const result = await getAnalysis(values);
    setIsLoading(false);

    if (result.error || !result.data) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error || 'An unknown error occurred.',
      });
      return;
    }

    setAnalysisResult(result.data);
  };

  const handleReset = () => {
    setAnalysisResult(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (analysisResult) {
    return <ReportDisplay result={analysisResult} onReset={handleReset} />;
  }

  return <QuestionnaireForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
}

function LoadingState() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                    Analyzing Your RevOps...
                </h1>
                <p className="text-muted-foreground md:text-xl">
                    Our AI is processing your information. This may take a moment.
                </p>
            </div>
            <Card>
                <CardContent className="p-6 space-y-6">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
