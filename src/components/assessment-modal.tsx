
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GtmReadinessForm } from './gtm-readiness-form';
import { useQuickAction } from '@/contexts/quick-action-context';
import * as React from 'react';
import { useRouter } from 'next/navigation';


export function AssessmentModal() {
  const { 
    isAssessmentModalOpen, 
    closeAssessmentModal, 
    onAssessmentCompleted, 
    assessmentToResume 
  } = useQuickAction();
  const router = useRouter();


  const handleAssessmentComplete = React.useCallback((assessmentId?: string) => {
    closeAssessmentModal();
    if (onAssessmentCompleted) {
      onAssessmentCompleted();
    }
    if (assessmentId) {
      router.push(`/assessment/${assessmentId}/report`);
    }
  }, [closeAssessmentModal, onAssessmentCompleted, router]);


  return (
    <Dialog open={isAssessmentModalOpen} onOpenChange={closeAssessmentModal}>
      <DialogContent className="h-full max-h-[90vh] w-full max-w-[90vw] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>GTM Readiness Assessment</DialogTitle>
          <DialogDescription>
            {assessmentToResume ? `Resuming assessment: ${assessmentToResume.name}` : 'Complete the form below to receive an AI-powered analysis of your go-to-market readiness.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <GtmReadinessForm 
            onComplete={handleAssessmentComplete}
            assessmentToResume={assessmentToResume}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
