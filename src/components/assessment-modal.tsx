import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type AssessmentModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AssessmentModal({ isOpen, onOpenChange }: AssessmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[90vw] max-w-none flex flex-col">
        <DialogHeader>
          <DialogTitle>New Assessment</DialogTitle>
          <DialogDescription>
            Start a new assessment by filling out the form below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 py-4">
          <p>Your assessment form will go here.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
