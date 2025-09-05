
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateEpic, type Epic } from '@/services/epic-service';
import { useQuickAction } from '@/contexts/quick-action-context';

export function EditEpicDialog() {
  const {
    isEditEpicDialogOpen,
    closeEditEpicDialog,
    onEpicUpdated,
    editEpicData,
  } = useQuickAction();
  
  const [item, setItem] = React.useState<Epic | null>(null);

  React.useEffect(() => {
    if (editEpicData) {
      setItem(editEpicData);
    }
  }, [editEpicData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!item) return;
    const { id, value } = e.target;
    setItem((prev) => ({ ...prev!, [id]: value }));
  };
  
   const handleSelectChange = (value: string) => {
    if (!item) return;
    setItem((prev) => ({ ...prev!, status: value as Epic['status'] }));
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await updateEpic(item.id, item);
      handleOpenChange(false);
      if (onEpicUpdated) {
        onEpicUpdated();
      }
    } catch (error) {
      console.error('Failed to update epic:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setItem(null);
      closeEditEpicDialog();
    }
  };

  if (!item) return null;
  
  return (
    <Dialog open={isEditEpicDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleUpdateItem}>
          <DialogHeader>
            <DialogTitle>Edit Epic</DialogTitle>
            <DialogDescription>
              Update the details for "{item.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={item.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea id="description" value={item.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
                <Select onValueChange={handleSelectChange} value={item.status}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                </Select>
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
