
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
import { updateTask, type Task, TaskPriority } from '@/services/task-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { useUser } from '@/contexts/user-context';
import { getContacts, Contact } from '@/services/contact-service';

export function EditTaskDialog() {
  const {
    isEditTaskDialogOpen,
    closeEditTaskDialog,
    onTaskUpdated,
    editTaskData,
  } = useQuickAction();
  const { user } = useUser();
  
  const [task, setTask] = React.useState<Task | null>(null);
  const [projectTeam, setProjectTeam] = React.useState<Contact[]>([]);

  React.useEffect(() => {
    if (editTaskData) {
      setTask(editTaskData);
      // This is a simplification. In a real app, you might fetch team members based on the project.
      // For now, let's assume we can fetch all contacts and filter.
      // Or better yet, we might need to pass the project's companyId to fetch relevant contacts.
      // For now we will just use the current user as an option.
      if (user?.displayName) {
        const currentUserAsContact = { name: user.displayName, id: user.uid, email: user.email!, phone: '', title: 'Current User', companyId: '', lastActivity: '', avatar: '' };
         // A more robust solution would be to get contacts for the project's company.
      }
    }
  }, [editTaskData, user]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!task) return;
    const { id, value } = e.target;
    setTask((prev) => ({ ...prev!, [id]: value }));
  };

  const handleSelectChange = (field: 'priority' | 'type' | 'owner') => (value: string) => {
     if (!task) return;
     if (field === 'owner') {
         const selectedUser = projectTeam.find(u => u.name === value) || { name: value, avatarUrl: '' };
         setTask((prev) => ({ ...prev!, owner: selectedUser.name, ownerAvatarUrl: selectedUser.avatar || '' }));
     } else {
        setTask((prev) => ({ ...prev!, [field]: value }));
     }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    try {
      const { id, ...updateData } = task;
      await updateTask(id, updateData);
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
              Update the details for "{task.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={task.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner" className="text-right">Owner</Label>
              <Input id="owner" value={task.owner} onChange={handleInputChange} className="col-span-3" required />
              {/* This is a simplified owner selector. A real implementation might use a searchable user select component. */}
              {/* <Select onValueChange={handleSelectChange('owner')} value={task.owner} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an owner" />
                </SelectTrigger>
                <SelectContent>
                  {user && <SelectItem value={user.displayName!}>{user.displayName}</SelectItem>}
                </SelectContent>
              </Select> */}
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
