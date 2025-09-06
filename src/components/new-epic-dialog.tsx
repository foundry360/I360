
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
import { createEpic, type Epic } from '@/services/epic-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getTags, type Tag } from '@/services/user-story-service';

type NewEpicState = Omit<Epic, 'id' | 'epicId'>;

const initialNewEpicState: NewEpicState = {
  projectId: '',
  title: '',
  description: '',
  status: 'To Do',
  category: 'Uncategorized',
};

export function NewEpicDialog() {
  const {
    isNewEpicDialogOpen,
    closeNewEpicDialog,
    onEpicCreated,
    newEpicData,
  } = useQuickAction();
  
  const [newItem, setNewItem] = React.useState<NewEpicState>(initialNewEpicState);
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([]);

  React.useEffect(() => {
    if (newEpicData) {
      setNewItem(prev => ({ ...prev, projectId: newEpicData.projectId }));
    }
    if (isNewEpicDialogOpen) {
      getTags().then(setAvailableTags);
    }
  }, [newEpicData, isNewEpicDialogOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewItem((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setNewItem((prev) => ({ ...prev, category: value }));
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) {
      alert('Title is required');
      return;
    }
    try {
      await createEpic(newItem);
      handleOpenChange(false); // Reset and close
      if (onEpicCreated) {
        onEpicCreated();
      }
    } catch (error) {
      console.error('Failed to create epic:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewItem(initialNewEpicState); // Reset state on close
      closeNewEpicDialog();
    }
  };
  
  return (
    <Dialog open={isNewEpicDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleCreateItem}>
          <DialogHeader>
            <DialogTitle>Create New Epic</DialogTitle>
            <DialogDescription>
              Fill in the details below to add an Epic to the project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={newItem.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea id="description" value={newItem.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select onValueChange={handleSelectChange} value={newItem.category}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableTags.map(tag => (
                            <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Epic</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
