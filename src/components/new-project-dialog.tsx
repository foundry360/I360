
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
import { createProject } from '@/services/project-service';
import { getCompanies, type Company } from '@/services/company-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { useUser } from '@/contexts/user-context';
import { format } from 'date-fns';


const initialNewProjectState = {
  name: '',
  companyId: '',
  owner: '',
  status: 'Active' as const,
  startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
};

export function NewProjectDialog() {
  const { isNewProjectDialogOpen, closeNewProjectDialog, onProjectCreated } = useQuickAction();
  const [newProject, setNewProject] = React.useState(initialNewProjectState);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const { user } = useUser();

  React.useEffect(() => {
    if (isNewProjectDialogOpen) {
      getCompanies().then(setCompanies);
      setNewProject(prev => ({ ...prev, owner: user?.displayName || user?.email || '' }));
    }
  }, [isNewProjectDialogOpen, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewProject((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: 'companyId' | 'status') => (value: string) => {
    setNewProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.companyId) {
      alert('Project name and company are required');
      return;
    }
    try {
      const selectedCompany = companies.find(c => c.id === newProject.companyId);
      if (!selectedCompany) {
          alert('Could not find selected company.');
          return;
      }
      
      const companyPrefix = selectedCompany.name.substring(0, 4).toUpperCase();
      const date = new Date(newProject.startDate + 'T00:00:00'); // Ensure date is parsed correctly
      const formattedDate = format(date, 'MMddyyyy');
      const formattedProjectName = `${companyPrefix}-${formattedDate}-${newProject.name}`;

      const projectPayload = {
          ...newProject,
          name: formattedProjectName
      };

      await createProject(projectPayload);
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Project Name
              </Label>
              <Input id="name" value={newProject.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyId" className="text-right">
                Company
              </Label>
              <Select onValueChange={handleSelectChange('companyId')} value={newProject.companyId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select onValueChange={handleSelectChange('status')} value={newProject.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner" className="text-right">
                Owner
              </Label>
              <Input id="owner" value={newProject.owner} onChange={handleInputChange} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input id="startDate" type="date" value={newProject.startDate} onChange={handleInputChange} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
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
