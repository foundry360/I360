
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
import { TaskPriority, TaskStatus } from '@/services/task-service';
import { Contact } from '@/services/contact-service';
import { useUser } from '@/contexts/user-context';
import { format, parseISO } from 'date-fns';
import { Rocket } from 'lucide-react';
import { Separator } from './ui/separator';

// MOCK USER DATA - Replace with a service call to fetch actual users
const mockUsers = [
    { id: 'user-1', displayName: 'Alice Johnson', photoURL: 'https://i.pravatar.cc/150?u=alice' },
    { id: 'user-2', displayName: 'Bob Williams', photoURL: 'https://i.pravatar.cc/150?u=bob' },
];
// END MOCK USER DATA

export function EditBacklogItemDialog() {
  const {
    isEditBacklogItemDialogOpen,
    closeEditBacklogItemDialog,
    onBacklogItemUpdated,
    editBacklogItemData,
  } = useQuickAction();
  
  const [item, setItem] = React.useState<BacklogItem | null>(null);
  const { user } = useUser();
  const [systemUsers, setSystemUsers] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (editBacklogItemData) {
      const { dueDate, ...restOfItem } = editBacklogItemData.item;
      setItem({
        ...restOfItem,
        dueDate: dueDate ? format(parseISO(dueDate), 'yyyy-MM-dd') : '',
      });
    }
    // In a real app, this would be a fetch to your user service.
    // For now, we combine the current logged-in user with our mock data.
    if (user) {
        const allUsers = [
            { id: user.uid, displayName: user.displayName || user.email, photoURL: user.photoURL },
            ...mockUsers
        ];
        // Remove duplicates
        const uniqueUsers = Array.from(new Set(allUsers.map(u => u.id)))
            .map(id => allUsers.find(u => u.id === id)!);
        setSystemUsers(uniqueUsers);
    }
  }, [editBacklogItemData, user]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!item) return;
    const { id, value } = e.target;
    setItem((prev) => ({ ...prev!, [id]: id === 'points' ? Number(value) : value }));
  };

  const handleSelectChange = (field: 'epicId' | 'priority' | 'status' | 'sprintId' | 'owner') => (value: string) => {
     if (!item) return;
     if (field === 'owner') {
        const selectedUser = systemUsers.find(u => u.displayName === value);
        if (selectedUser) {
            setItem(prev => ({...prev!, owner: selectedUser.displayName!, ownerAvatarUrl: selectedUser.photoURL || '' }));
        }
     } else {
        setItem((prev) => ({ ...prev!, [field]: value === 'null' ? null : value }));
     }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      const dataToSave = {
        ...item,
        dueDate: item.dueDate || null, // Send null if empty, service will handle deletion
      };
      await updateBacklogItem(item.id, dataToSave);
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
  
  const sprint = editBacklogItemData?.sprints.find(s => s.id === item.sprintId);
  const isStatusDisabled = sprint?.status === 'Not Started' || sprint?.status === 'Completed';


  return (
    <Dialog open={isEditBacklogItemDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleUpdateItem}>
          <DialogHeader>
            <DialogTitle>Edit Backlog Item</DialogTitle>
            <DialogDescription>
              Update the details for "{item.title}"
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
              <Label htmlFor="owner" className="text-right">Owner</Label>
              <Select onValueChange={handleSelectChange('owner')} value={item.owner} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an owner" />
                  </SelectTrigger>
                  <SelectContent>
                      {systemUsers.map((u) => (
                          <SelectItem key={u.id} value={u.displayName!}>{u.displayName}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sprintId" className="text-right">Wave</Label>
              <Select onValueChange={handleSelectChange('sprintId')} value={item.sprintId ?? 'null'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Assign to a wave" />
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
                <Select onValueChange={handleSelectChange('status')} value={item.status} disabled={isStatusDisabled}>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <Input id="dueDate" type="date" value={item.dueDate || ''} onChange={handleInputChange} className="col-span-3" />
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
