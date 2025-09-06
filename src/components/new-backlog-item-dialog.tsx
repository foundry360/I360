
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from './ui/textarea';
import { createBacklogItem, type BacklogItem } from '@/services/backlog-item-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import type { Epic } from '@/services/epic-service';
import { TaskPriority } from '@/services/task-service';
import { getProject } from '@/services/project-service';

type NewBacklogItemState = Omit<BacklogItem, 'id' | 'backlogId'>;

const initialNewItemState: NewBacklogItemState = {
  projectId: '',
  epicId: '',
  title: '',
  description: '',
  status: 'To Do',
  points: 0,
  priority: 'Medium',
  owner: '',
  ownerAvatarUrl: '',
  dueDate: '',
};

export function NewBacklogItemDialog() {
  const {
    isNewBacklogItemDialogOpen,
    closeNewBacklogItemDialog,
    onBacklogItemCreated,
    newBacklogItemData,
  } = useQuickAction();
  
  const [newItem, setNewItem] = React.useState<NewBacklogItemState>(initialNewItemState);

  React.useEffect(() => {
    const setInitialOwner = async () => {
        if (newBacklogItemData?.projectId) {
            const project = await getProject(newBacklogItemData.projectId);
            if (project) {
                 setNewItem(prev => ({ 
                    ...prev, 
                    projectId: newBacklogItemData.projectId,
                    owner: project.owner,
                    ownerAvatarUrl: project.ownerAvatarUrl || '',
                }));
            }
        }
    }
    if(isNewBacklogItemDialogOpen) {
        setInitialOwner();
    }
  }, [newBacklogItemData, isNewBacklogItemDialogOpen]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewItem((prev) => ({ ...prev, [id]: id === 'points' ? Number(value) : value }));
  };

  const handleSelectChange = (field: 'epicId' | 'priority') => (value: string) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.epicId || !newItem.owner) {
      alert('Title and Epic are required, and an owner must be set on the project');
      return;
    }
    try {
      await createBacklogItem(newItem);
      handleOpenChange(false); // Reset and close
      if (onBacklogItemCreated) {
        onBacklogItemCreated();
      }
    } catch (error) {
      console.error('Failed to create backlog item:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewItem(initialNewItemState); // Reset state on close
      closeNewBacklogItemDialog();
    }
  };
  
  return (
    <Dialog open={isNewBacklogItemDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleCreateItem}>
          <DialogHeader>
            <DialogTitle>Create New Backlog Item</DialogTitle>
            <DialogDescription>
              Fill in the details below to add an item to the project backlog. The owner will be automatically assigned from the project.
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
              <Label htmlFor="epicId" className="text-right">Epic</Label>
              <Select onValueChange={handleSelectChange('epicId')} value={newItem.epicId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an epic" />
                </SelectTrigger>
                <SelectContent>
                  {newBacklogItemData?.epics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>{epic.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">Story Points</Label>
                <Input id="points" type="number" value={newItem.points} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <Select onValueChange={handleSelectChange('priority')} value={newItem.priority}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskPriority).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <Input id="dueDate" type="date" value={newItem.dueDate} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
