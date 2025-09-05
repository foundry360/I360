
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
import { updateProject, type Project } from '@/services/project-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { useUser } from '@/contexts/user-context';
import { parseISO } from 'date-fns';

// MOCK USER DATA - Replace with a service call to fetch actual users
const mockUsers = [
    { id: 'user-1', displayName: 'Alice Johnson', photoURL: 'https://i.pravatar.cc/150?u=alice' },
    { id: 'user-2', displayName: 'Bob Williams', photoURL: 'https://i.pravatar.cc/150?u=bob' },
];
// END MOCK USER DATA

export function EditProjectDialog() {
  const {
    isEditProjectDialogOpen,
    closeEditProjectDialog,
    onProjectUpdated,
    editProjectData,
  } = useQuickAction();
  
  const [formData, setFormData] = React.useState<Project | null>(null);
  const { user } = useUser();
  const [systemUsers, setSystemUsers] = React.useState<any[]>([]);
  
  const [engagementNamePrefix, setEngagementNamePrefix] = React.useState('');
  const [engagementNameSuffix, setEngagementNameSuffix] = React.useState('');


  React.useEffect(() => {
    if (editProjectData) {
      // Remove companyName before setting form data to avoid sending it back
      const { companyName, ...projectData } = editProjectData;
      setFormData({
          ...projectData,
          startDate: projectData.startDate ? new Date(projectData.startDate).toISOString().split('T')[0] : '',
          endDate: projectData.endDate ? new Date(projectData.endDate).toISOString().split('T')[0] : '',
      });
      
      const nameParts = projectData.name.split('-');
      if (nameParts.length > 1) {
        setEngagementNamePrefix(`${nameParts[0]}-`);
        setEngagementNameSuffix(nameParts.slice(1).join('-'));
      } else {
        // Fallback for names that might not have a prefix
        const prefix = companyName ? `${companyName.substring(0,4).toUpperCase()}-` : '';
        setEngagementNamePrefix(prefix);
        setEngagementNameSuffix(projectData.name);
      }
    }
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
  }, [editProjectData, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev!, [id]: value }));
  };
  
  const handleNameSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEngagementNameSuffix(e.target.value);
  };

  const handleSelectChange = (field: 'status' | 'category' | 'priority' | 'owner') => (value: string) => {
    if (!formData) return;
    if (field === 'owner') {
        const selectedUser = systemUsers.find(u => u.displayName === value);
        if (selectedUser) {
            setFormData(prev => ({...prev!, owner: selectedUser.displayName!, ownerAvatarUrl: selectedUser.photoURL || '' }));
        }
    } else {
        setFormData((prev) => ({ ...prev!, [field]: value }));
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    try {
      const { id, ...updateData } = formData;
      const reconstructedName = `${engagementNamePrefix}${engagementNameSuffix}`;
      const dataToSave = {
          ...updateData,
          name: reconstructedName,
          startDate: parseISO(updateData.startDate).toISOString(),
          endDate: updateData.endDate ? parseISO(updateData.endDate).toISOString() : undefined,
      };

      await updateProject(id, dataToSave);
      handleOpenChange(false);
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (error) {
      console.error('Failed to update engagement:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(null);
      setEngagementNamePrefix('');
      setEngagementNameSuffix('');
      closeEditProjectDialog();
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isEditProjectDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleUpdateProject}>
          <DialogHeader>
            <DialogTitle>Edit Engagement</DialogTitle>
            <DialogDescription>
              Update the details for "{formData.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
               <div className="col-span-3 flex items-center gap-1 rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
                  <span className="pl-3 pr-1 text-muted-foreground">{engagementNamePrefix}</span>
                  <Input 
                    id="name" 
                    value={engagementNameSuffix} 
                    onChange={handleNameSuffixChange} 
                    className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                    required 
                  />
               </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea id="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner" className="text-right">Owner</Label>
              <Select onValueChange={handleSelectChange('owner')} value={formData.owner}>
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
              <Label htmlFor="team" className="text-right">Team</Label>
              <Input id="team" value={formData.team} onChange={handleInputChange} className="col-span-3" placeholder="Comma-separated names" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select onValueChange={handleSelectChange('category')} value={formData.category}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Execution">Execution</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Enablement">Enablement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <Select onValueChange={handleSelectChange('priority')} value={formData.priority}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select onValueChange={handleSelectChange('status')} value={formData.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">Start Date</Label>
              <Input id="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">End Date</Label>
              <Input id="endDate" type="date" value={formData.endDate || ''} onChange={handleInputChange} className="col-span-3" />
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
