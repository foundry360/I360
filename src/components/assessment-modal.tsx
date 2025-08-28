import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GtmReadinessForm } from './gtm-readiness-form';

type AssessmentModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAssessmentComplete: () => void;
};

export function AssessmentModal({ isOpen, onOpenChange, onAssessmentComplete }: AssessmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-full max-h-[90vh] w-full max-w-[90vw] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>GTM Readiness Assessment</DialogTitle>
          <DialogDescription>
            Complete the form below to receive an AI-powered analysis of your
            go-to-market readiness.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <GtmReadinessForm onComplete={() => {
            onOpenChange(false);
            onAssessmentComplete();
          }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
