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
};

export function AssessmentModal({ isOpen, onOpenChange }: AssessmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[90vw] max-w-none flex flex-col">
        <DialogHeader>
          <DialogTitle>GTM Readiness Assessment</DialogTitle>
          <DialogDescription>
            Complete the form below to receive an AI-powered analysis of your
            go-to-market readiness.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6">
          <GtmReadinessForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
