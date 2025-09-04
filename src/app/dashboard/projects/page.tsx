
'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getProjects, deleteProject, deleteProjects, Project } from '@/services/project-service';
import { useUser } from '@/contexts/user-context';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { TablePagination } from '@/components/table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatInTimeZone } from 'date-fns-tz';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type SortKey = keyof Project;
type ProjectStatus = 'Active' | 'Inactive' | 'Completed' | 'On Hold';
type TabValue = 'active' | 'inactive';

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'startDate', direction: 'descending' });
  const [activeTab, setActiveTab] = React.useState<TabValue>('active');

  const { openNewProjectDialog, setOnProjectCreated, openEditProjectDialog, setOnProjectUpdated, globalSearchTerm } = useQuickAction();
  const { user } = useUser();

  const fetchProjects = React.useCallback(async () => {
    try {
      setLoading(true);
      const projectsFromDb = await getProjects();
      setProjects(projectsFromDb);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProjects();
    const unsubscribeCreated = setOnProjectCreated(fetchProjects);
    const unsubscribeUpdated = setOnProjectUpdated(fetchProjects);
    return () => {
      if (unsubscribeCreated) unsubscribeCreated();
      if (unsubscribeUpdated) unsubscribeUpdated();
    };
  }, [fetchProjects, setOnProjectCreated, setOnProjectUpdated]);
  
  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleSelectProject = (projectId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProjects((prev) => [...prev, projectId]);
    } else {
      setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    const currentVisibleIds = filteredProjects
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((p) => p.id);
    if (isSelected) {
      setSelectedProjects((prev) => [...new Set([...prev, ...currentVisibleIds])]);
    } else {
      setSelectedProjects((prev) => prev.filter((id) => !currentVisibleIds.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteProjects(selectedProjects);
      setSelectedProjects([]);
      setIsDeleteDialogOpen(true); 
      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete projects:', error);
    }
  };

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredProjects = React.useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'Active');
    const inactiveProjects = projects.filter(p => p.status !== 'Active');
    
    let itemsToFilter = activeTab === 'active' ? activeProjects : inactiveProjects;

    let sortableItems = [...itemsToFilter];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems.filter(project => 
        project.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        (project.companyName || '').toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        project.owner.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );
  }, [projects, sortConfig, globalSearchTerm, activeTab]);

  React.useEffect(() => {
    setPage(0);
    setSelectedProjects([]);
  }, [activeTab]);
  
  const currentVisibleProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const numSelected = selectedProjects.length;
  const numSelectedOnPage = currentVisibleProjects.filter(c => selectedProjects.includes(c.id)).length;
  const allOnPageSelected = numSelectedOnPage > 0 && numSelectedOnPage === currentVisibleProjects.length;
  const isPageIndeterminate = numSelectedOnPage > 0 && numSelectedOnPage < currentVisibleProjects.length;

  const getDisplayName = (email: string | null | undefined) => {
    if(!email) return 'N/A';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const statusBadgeVariant = (status: ProjectStatus) => {
    switch(status) {
        case 'Active': return 'default';
        case 'Completed': return 'secondary';
        case 'On Hold': return 'outline';
        case 'Inactive': return 'destructive';
        default: return 'secondary';
    }
  }

  const formatDate = (isoDate: string) => {
    if (!isoDate) return 'N/A';
    return formatInTimeZone(isoDate, 'UTC', 'MMM dd, yyyy');
  }

  return (
    <>
      <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
                Manage and track all projects across your companies.
            </p>
        </div>
        <Separator />
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
            <div className="flex justify-between items-center">
                <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    {numSelected > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({numSelected})
                    </Button>
                    )}
                    <Button size="icon" onClick={openNewProjectDialog}>
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">New Project</span>
                    </Button>
                </div>
            </div>
            <TabsContent value={activeTab} className="mt-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">Total Records: {filteredProjects.length}</div>
                </div>
                <div className="border rounded-lg">
                    {loading ? (
                        <div className="space-y-4 p-6">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] border-t border-b">
                                        <Checkbox
                                            checked={allOnPageSelected}
                                            onCheckedChange={(checked) =>
                                            handleSelectAll(checked as boolean)
                                            }
                                            aria-label="Select all on page"
                                            data-state={isPageIndeterminate ? 'indeterminate' : (allOnPageSelected ? 'checked' : 'unchecked')}
                                        />
                                    </TableHead>
                                    <TableHead className="border-t border-r border-b">
                                        <Button variant="ghost" onClick={() => requestSort('name')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                            <div className="flex justify-between items-center w-full">
                                                Project Name
                                                <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'name' ? 'opacity-100' : 'opacity-25')} />
                                            </div>
                                        </Button>
                                    </TableHead>
                                    <TableHead className="border-t border-r border-b">
                                        <Button variant="ghost" onClick={() => requestSort('companyName')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                            <div className="flex justify-between items-center w-full">
                                                Company
                                                <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'companyName' ? 'opacity-100' : 'opacity-25')} />
                                            </div>
                                        </Button>
                                    </TableHead>
                                    <TableHead className="border-t border-r border-b">
                                        <Button variant="ghost" onClick={() => requestSort('status')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                            <div className="flex justify-between items-center w-full">
                                                Status
                                                <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'status' ? 'opacity-100' : 'opacity-25')} />
                                            </div>
                                        </Button>
                                    </TableHead>
                                    <TableHead className="border-t border-r border-b">
                                        <Button variant="ghost" onClick={() => requestSort('owner')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                            <div className="flex justify-between items-center w-full">
                                                Owner
                                                <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'owner' ? 'opacity-100' : 'opacity-25')} />
                                            </div>
                                        </Button>
                                    </TableHead>
                                    <TableHead className="border-t border-r border-b">
                                        <Button variant="ghost" onClick={() => requestSort('startDate')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                            <div className="flex justify-between items-center w-full">
                                                Start Date
                                                <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'startDate' ? 'opacity-100' : 'opacity-25')} />
                                            </div>
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right border-t border-b"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentVisibleProjects.length > 0 ? (
                                    currentVisibleProjects.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedProjects.includes(project.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectProject(project.id, checked as boolean)
                                                    }
                                                    aria-label={`Select ${project.name}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                               <Link href={`/dashboard/projects/${project.id}`} className="hover:text-primary">
                                                    {project.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/dashboard/companies/${project.companyId}/details`} className="hover:text-primary">
                                                    {project.companyName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusBadgeVariant(project.status)} className={project.status === 'Active' ? 'bg-green-500' : ''}>
                                                    {project.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={project.ownerAvatarUrl} />
                                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                            {getInitials(project.owner)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{project.owner || getDisplayName(user?.email)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(project.startDate)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => openEditProjectDialog(project)}>Edit Project</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                        onClick={() => openDeleteDialog(project)}
                                                        className="text-destructive"
                                                        >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No projects found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
                <div className="flex justify-end mt-4">
                    <TablePagination
                        count={filteredProjects.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(newPage) => setPage(newPage)}
                        onRowsPerPageChange={(newRowsPerPage) => {
                            setRowsPerPage(newRowsPerPage);
                            setPage(0);
                        }}
                    />
                </div>
            </TabsContent>
        </Tabs>
        
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected projects.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={numSelected > 0 ? handleBulkDelete : handleDeleteProject}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

