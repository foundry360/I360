
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
import { createSprint, type Sprint } from '@/services/sprint-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { add, format } from 'date-fns';
import { cn } from '@/lib/utils';

type NewSprintState = Omit<Sprint, 'id'>;

const getInitialNewSprintState = (projectId: string): NewSprintState => {
  const today = new Date();
  const twoWeeksFromNow = add(today, { weeks: 2 });
  return {
    projectId: projectId,
    name: '',
    goal: '',
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(twoWeeksFromNow, 'yyyy-MM-dd'),
    status: 'Not Started',
  };
};

export function NewSprintDialog() {
  const {
    isNewSprintDialogOpen,
    closeNewSprintDialog,
    onSprintCreated,
    newSprintData,
  } = useQuickAction();
  
  const [newItem, setNewItem] = React.useState<NewSprintState>(getInitialNewSprintState(''));

  React.useEffect(() => {
    if (newSprintData?.projectId) {
      setNewItem(getInitialNewSprintState(newSprintData.projectId));
    }
  }, [newSprintData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewItem((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.startDate || !newItem.endDate) {
      alert('Wave Name, Start Date, and End Date are required');
      return;
    }
    try {
      await createSprint(newItem);
      handleOpenChange(false); // Reset and close
      if (onSprintCreated) {
        onSprintCreated();
      }
    } catch (error) {
      console.error('Failed to create wave:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewItem(getInitialNewSprintState('')); // Reset state on close
      closeNewSprintDialog();
    }
  };
  
  return (
    <Dialog open={isNewSprintDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleCreateItem}>
          <DialogHeader>
            <DialogTitle>Create New Wave</DialogTitle>
            <DialogDescription>
              Plan your next iteration by defining its goal and duration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Wave Name</Label>
              <Input id="name" value={newItem.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="goal" className="text-right pt-2">Wave Goal</Label>
              <Textarea id="goal" value={newItem.goal} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">Start Date</Label>
              <Input id="startDate" type="date" value={newItem.startDate} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">End Date</Label>
              <Input id="endDate" type="date" value={newItem.endDate} onChange={handleInputChange} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className={cn('dark:btn-outline-cancel')}>
              Cancel
            </Button>
            <Button type="submit">Create Wave</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
