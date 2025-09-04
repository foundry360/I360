
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
import { updateTask, type Task, TaskPriority, deleteTask } from '@/services/task-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { useUser } from '@/contexts/user-context';
import { getBacklogItemsForProject, updateBacklogItem } from '@/services/backlog-item-service';
import { Archive } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Contact } from '@/services/contact-service';

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
      setTask(editTaskData.task);
      setProjectTeam(editTaskData.contacts);
    }
  }, [editTaskData]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!task) return;
    const { id, value } = e.target;
    setTask((prev) => ({ ...prev!, [id]: value }));
  };

  const handleSelectChange = (field: 'priority' | 'type' | 'owner') => (value: string) => {
     if (!task) return;
     if (field === 'owner') {
         const selectedUser = projectTeam.find(u => u.name === value) || { name: value, avatar: '' };
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
  
  const handleMoveToBacklog = async () => {
    if (!task || !task.backlogId) return;
    try {
        // Find the corresponding backlog item
        const backlogItems = await getBacklogItemsForProject(task.projectId);
        const correspondingItem = backlogItems.find(item => item.backlogId === task.backlogId);

        if (correspondingItem) {
            // Update the backlog item to remove it from the sprint
            await updateBacklogItem(correspondingItem.id, { sprintId: null });
        }

        // Delete the task from the board
        await deleteTask(task.id);
        
        // Close dialog and refresh
        handleOpenChange(false);
        if (onTaskUpdated) {
            onTaskUpdated();
        }
    } catch (error) {
        console.error("Failed to move task to backlog:", error);
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
              <Select onValueChange={handleSelectChange('owner')} value={task.owner} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an owner" />
                </SelectTrigger>
                <SelectContent>
                  {projectTeam.map(contact => (
                    <SelectItem key={contact.id} value={contact.name}>{contact.name}</SelectItem>
                  ))}
                  {user && !projectTeam.some(c => c.name === user.displayName) && (
                    <SelectItem value={user.displayName!}>{user.displayName}</SelectItem>
                  )}
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
          </div>
          <DialogFooter className="pt-4 flex justify-between items-center w-full">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" onClick={handleMoveToBacklog}>
                                <Archive className="h-4 w-4" />
                                <span className="sr-only">Move to Backlog</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Move to Backlog</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button type="submit">Save Changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
