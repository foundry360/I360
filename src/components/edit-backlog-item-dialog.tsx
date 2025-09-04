
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
import { updateBacklogItem, type BacklogItem } from '@/services/backlog-item-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import type { Epic } from '@/services/epic-service';
import type { Sprint } from '@/services/sprint-service';
import { TaskPriority } from '@/services/task-service';

export function EditBacklogItemDialog() {
  const {
    isEditBacklogItemDialogOpen,
    closeEditBacklogItemDialog,
    onBacklogItemUpdated,
    editBacklogItemData,
  } = useQuickAction();
  
  const [item, setItem] = React.useState<BacklogItem | null>(null);

  React.useEffect(() => {
    if (editBacklogItemData) {
      setItem(editBacklogItemData.item);
    }
  }, [editBacklogItemData]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!item) return;
    const { id, value } = e.target;
    setItem((prev) => ({ ...prev!, [id]: id === 'points' ? Number(value) : value }));
  };

  const handleSelectChange = (field: 'epicId' | 'priority' | 'status' | 'sprintId') => (value: string) => {
     if (!item) return;
    setItem((prev) => ({ ...prev!, [field]: value === 'null' ? null : value }));
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await updateBacklogItem(item.id, item);
      handleOpenChange(false);
      if (onBacklogItemUpdated) {
        onBacklogItemUpdated();
      }
    } catch (error) {
      console.error('Failed to update backlog item:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setItem(null);
      closeEditBacklogItemDialog();
    }
  };
  
  if (!item) return null;

  return (
    <Dialog open={isEditBacklogItemDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleUpdateItem}>
          <DialogHeader>
            <DialogTitle>Edit Backlog Item</DialogTitle>
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
              <Label htmlFor="epicId" className="text-right">Epic</Label>
              <Select onValueChange={handleSelectChange('epicId')} value={item.epicId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an epic" />
                </SelectTrigger>
                <SelectContent>
                  {editBacklogItemData?.epics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>{epic.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sprintId" className="text-right">Sprint</Label>
              <Select onValueChange={handleSelectChange('sprintId')} value={item.sprintId ?? 'null'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Assign to a sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'null'}>Backlog</SelectItem>
                  {editBacklogItemData?.sprints.filter(s => s.status !== 'Completed').map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select onValueChange={handleSelectChange('status')} value={item.status}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">Story Points</Label>
                <Input id="points" type="number" value={item.points} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <Select onValueChange={handleSelectChange('priority')} value={item.priority}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskPriority).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
