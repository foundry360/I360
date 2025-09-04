
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
import { createProject } from '@/services/project-service';
import { getCompanies, type Company } from '@/services/company-service';
import { getContactsForCompany, type Contact } from '@/services/contact-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { useUser } from '@/contexts/user-context';

const initialNewProjectState = {
  name: '',
  description: '',
  companyId: '',
  owner: '',
  team: '',
  category: 'Planning',
  status: 'Active' as const,
  priority: 'Medium',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
};

export function NewProjectDialog() {
  const { isNewProjectDialogOpen, closeNewProjectDialog, onProjectCreated } = useQuickAction();
  const [newProject, setNewProject] = React.useState(initialNewProjectState);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const { user } = useUser();

  React.useEffect(() => {
    if (isNewProjectDialogOpen) {
      getCompanies().then(setCompanies);
      setNewProject(prev => ({ ...prev, owner: user?.displayName || user?.email || '' }));
    }
  }, [isNewProjectDialogOpen, user]);
  
  React.useEffect(() => {
      if (newProject.companyId) {
          getContactsForCompany(newProject.companyId).then(setContacts);
      } else {
          setContacts([]);
      }
  }, [newProject.companyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewProject((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: 'companyId' | 'status' | 'category' | 'priority' | 'owner') => (value: string) => {
    if (field === 'companyId') {
        setNewProject((prev) => ({ ...prev, [field]: value, owner: '' })); // Reset owner when company changes
    } else {
        setNewProject((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.companyId) {
      alert('Project name and company are required');
      return;
    }
    try {
      const company = companies.find(c => c.id === newProject.companyId);
      if (!company) {
          alert('Could not find selected company');
          return;
      }
      
      const companyPrefix = company.name.substring(0, 4).toUpperCase();
      const formattedName = `${companyPrefix}-${newProject.name}`;

      const projectToCreate = {
        ...newProject,
        name: formattedName,
      };

      await createProject(projectToCreate);
      setNewProject(initialNewProjectState);
      closeNewProjectDialog();
      if (onProjectCreated) {
        onProjectCreated();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewProject(initialNewProjectState);
      closeNewProjectDialog();
    }
  };

  return (
    <Dialog open={isNewProjectDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleCreateProject}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={newProject.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea id="description" value={newProject.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyId" className="text-right">Company</Label>
              <Select onValueChange={handleSelectChange('companyId')} value={newProject.companyId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner" className="text-right">Owner</Label>
              <Select onValueChange={handleSelectChange('owner')} value={newProject.owner} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.name}>{contact.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team" className="text-right">Team</Label>
              <Input id="team" value={newProject.team} onChange={handleInputChange} className="col-span-3" placeholder="Comma-separated names" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select onValueChange={handleSelectChange('category')} value={newProject.category}>
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
              <Select onValueChange={handleSelectChange('priority')} value={newProject.priority}>
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
              <Select onValueChange={handleSelectChange('status')} value={newProject.status}>
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
              <Input id="startDate" type="date" value={newProject.startDate} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">End Date</Label>
              <Input id="endDate" type="date" value={newProject.endDate} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
