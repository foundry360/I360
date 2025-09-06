
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
import { updateTask, type Task, TaskPriority, TaskStatus, deleteTask } from '@/services/task-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { useUser } from '@/contexts/user-context';
import { Contact } from '@/services/contact-service';
import { Textarea } from './ui/textarea';
import { format, parseISO } from 'date-fns';

export function EditTaskDialog() {
  const {
    isEditTaskDialogOpen,
    closeEditTaskDialog,
    onTaskUpdated,
    editTaskData,
  } = useQuickAction();
  const { user } = useUser();
  
  const [task, setTask] = React.useState<Task | null>(null);

  React.useEffect(() => {
    if (editTaskData) {
      const { dueDate, ...restOfTask } = editTaskData.task;
      setTask({
        ...restOfTask,
        dueDate: dueDate ? format(parseISO(dueDate), 'yyyy-MM-dd') : '',
      });
    }
  }, [editTaskData]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!task) return;
    const { id, value } = e.target;
    setTask((prev) => ({ ...prev!, [id]: value }));
  };

  const handleSelectChange = (field: 'priority' | 'type' | 'status') => (value: string) => {
     if (!task) return;
     setTask((prev) => ({ ...prev!, [field]: value }));
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    try {
      const { id, ...updateData } = task;
       const dataToSave = {
        ...updateData,
        dueDate: task.dueDate || undefined,
      };
      await updateTask(id, dataToSave);
      handleOpenChange(false);
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTask(null);
      closeEditTaskDialog();
    }
  };
  
  if (!task) return null;

  return (
    <Dialog open={isEditTaskDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleUpdateItem}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the details for "{task.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={task.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" value={(task as any).description || ''} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner" className="text-right">Owner</Label>
              <Input id="owner" value={task.owner} className="col-span-3" disabled />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
                <Select onValueChange={handleSelectChange('status')} value={task.status}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(TaskStatus).map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <Select onValueChange={handleSelectChange('priority')} value={task.priority}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskPriority).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select onValueChange={handleSelectChange('type')} value={task.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {(['Assessment', 'Workshop', 'Enablement', 'Planning', 'Execution', 'Review'] as const).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <Input id="dueDate" type="date" value={task.dueDate || ''} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter className="pt-4 flex justify-between items-center w-full">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
                <Button type="submit">Save Changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
