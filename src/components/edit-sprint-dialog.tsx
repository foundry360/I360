
'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from './ui/textarea';
import { updateSprint, type Sprint } from '@/services/sprint-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { format, parseISO } from 'date-fns';

export function EditSprintDialog() {
  const {
    isEditSprintDialogOpen,
    closeEditSprintDialog,
    onSprintUpdated,
    editSprintData,
  } = useQuickAction();
  
  const [item, setItem] = React.useState<Sprint | null>(null);

  React.useEffect(() => {
    if (editSprintData) {
      setItem({
        ...editSprintData,
        startDate: format(parseISO(editSprintData.startDate), 'yyyy-MM-dd'),
        endDate: format(parseISO(editSprintData.endDate), 'yyyy-MM-dd'),
      });
    }
  }, [editSprintData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!item) return;
    const { id, value } = e.target;
    setItem((prev) => ({ ...prev!, [id]: value }));
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      const { id, ...updateData } = item;
      await updateSprint(id, updateData);
      handleOpenChange(false);
      if (onSprintUpdated) {
        onSprintUpdated();
      }
    } catch (error) {
      console.error('Failed to update wave:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setItem(null);
      closeEditSprintDialog();
    }
  };

  if (!item) return null;
  
  return (
    <Dialog open={isEditSprintDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleUpdateItem}>
          <DialogHeader>
            <DialogTitle>Edit Wave</DialogTitle>
            <DialogDescription>
              Update the details for "{item.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Wave Name</Label>
              <Input id="name" value={item.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="goal" className="text-right pt-2">Wave Goal</Label>
              <Textarea id="goal" value={item.goal} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">Start Date</Label>
              <Input id="startDate" type="date" value={item.startDate} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">End Date</Label>
              <Input id="endDate" type="date" value={item.endDate} onChange={handleInputChange} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
