
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MoreHorizontal, Plus, Trash2, ArrowUpDown, Search, Star, List, LayoutGrid, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getProjects, deleteProject, deleteProjects, Project, updateProject } from '@/services/project-service';
import { getBacklogItemsForProject } from '@/services/backlog-item-service';
import { getTasksForProject } from '@/services/task-service';
import { getEpicsForProject } from '@/services/epic-service';
import { getSprintsForProject } from '@/services/sprint-service';
import { useUser } from '@/contexts/user-context';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { TablePagination } from '@/components/ui/table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

type SortKey = keyof Project;
type ProjectStatus = 'Active' | 'Inactive' | 'Completed' | 'On Hold';
type TabValue = 'active' | 'inactive';
type ViewMode = 'list' | 'grid';


export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'lastActivity', direction: 'descending' });
  const [activeTab, setActiveTab] = React.useState<TabValue>('active');
  const [isDependencyErrorDialogOpen, setIsDependencyErrorDialogOpen] = React.useState(false);
  const [dependencyErrorDialogMessage, setDependencyErrorDialogMessage] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');

  const { openNewProjectDialog, setOnProjectCreated, openEditProjectDialog, setOnProjectUpdated, globalSearchTerm, setGlobalSearchTerm } = useQuickAction();
  const { user } = useUser();
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchProjects = React.useCallback(async () => {
    try {
      setLoading(true);
      const projectsFromDb = await getProjects();
      const projectsWithProgress = await Promise.all(projectsFromDb.map(async (p) => {
        const items = await getBacklogItemsForProject(p.id);
        const total = items.length;
        const completed = items.filter(i => i.status === 'Complete').length;
        return { ...p, progress: total > 0 ? (completed / total) * 100 : 0 };
      }));
      setProjects(projectsWithProgress);
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

    const handleFocus = () => fetchProjects();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (unsubscribeCreated) unsubscribeCreated();
      if (unsubscribeUpdated) unsubscribeUpdated();
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchProjects, setOnProjectCreated, setOnProjectUpdated]);

  React.useEffect(() => {
    if (globalSearchTerm) {
      setIsSearchVisible(true);
    }
  }, [globalSearchTerm]);

  React.useEffect(() => {
    return () => {
      if(window.location.pathname !== '/dashboard') {
          setGlobalSearchTerm('');
      }
    };
  }, [setGlobalSearchTerm]);

  const hasDependencies = async (projectId: string) => {
    const [backlogItems, epics, sprints, tasks] = await Promise.all([
      getBacklogItemsForProject(projectId),
      getEpicsForProject(projectId),
      getSprintsForProject(projectId),
      getTasksForProject(projectId),
    ]);
    return backlogItems.length > 0 || epics.length > 0 || sprints.length > 0 || tasks.length > 0;
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    const dependenciesExist = await hasDependencies(projectToDelete.id);
    if (dependenciesExist) {
        setDependencyErrorDialogMessage(`The engagement "${projectToDelete.name}" cannot be deleted because it has associated epics, waves, tasks or backlog items. Please remove these items before deleting the engagement.`);
        setIsDependencyErrorDialogOpen(true);
        setIsDeleteDialogOpen(false);
        return;
    }

    try {
      await deleteProject(projectToDelete.id);
      toast({ title: "Engagement Deleted", description: `"${projectToDelete.name}" has been deleted.`});
      setProjectToDelete(null);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({ variant: "destructive", title: "Error", description: "There was a problem deleting the engagement."});
    } finally {
        setIsDeleteDialogOpen(false);
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
    const projectsWithDeps = [];
    for (const projectId of selectedProjects) {
      if (await hasDependencies(projectId)) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            projectsWithDeps.push(project.name);
        }
      }
    }
    
    if (projectsWithDeps.length > 0) {
        setDependencyErrorDialogMessage(`The following engagements cannot be deleted because they have associated items: ${projectsWithDeps.join(', ')}. Please clear their items first.`);
        setIsDependencyErrorDialogOpen(true);
        setIsDeleteDialogOpen(false);
        return;
    }

    try {
      await deleteProjects(selectedProjects);
      toast({ title: "Engagements Deleted", description: `${selectedProjects.length} engagements have been deleted.`});
      setSelectedProjects([]);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete projects:', error);
      toast({ variant: "destructive", title: "Error", description: "There was a problem deleting the selected engagements."});
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleToggleStar = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    await updateProject(project.id, { isStarred: !project.isStarred });
    await fetchProjects();
  }

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
        case 'Active': return 'success';
        case 'Completed': return 'secondary';
        case 'On Hold': return 'warning';
        case 'Inactive': return 'danger';
        default: return 'secondary';
    }
  }

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'N/A';
    try {
        const date = parseISO(isoDate);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'Invalid Date';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold">Engagements</h1>
            <p className="text-muted-foreground">
                Manage and track all engagements across your companies
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
                    {numSelected > 0 && viewMode === 'list' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({numSelected})
                    </Button>
                    )}
                    <div className="flex items-center gap-1 p-1 rounded-md bg-muted">
                        <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                         <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('grid')}>
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    {isSearchVisible && (
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search engagements..." 
                                className="pl-8 w-48 md:w-64"
                                value={globalSearchTerm}
                                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(!isSearchVisible)}>
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Button size="icon" onClick={openNewProjectDialog}>
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">New Engagement</span>
                    </Button>
                </div>
            </div>
            <TabsContent value={activeTab} className="mt-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">Total Records: {filteredProjects.length}</div>
                </div>
                {viewMode === 'list' ? (
                     <div className="border rounded-lg">
                        {loading ? (
                            <div className="space-y-4 p-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
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
                                        <TableHead className="w-[50px] border-t border-b">
                                            <Button variant="ghost" onClick={() => requestSort('isStarred')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                            <Star className={cn("h-4 w-4", sortConfig?.key === 'isStarred' ? 'opacity-100' : 'opacity-25')} />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="border-t border-r border-b">
                                            <Button variant="ghost" onClick={() => requestSort('name')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                                <div className="flex justify-between items-center w-full">
                                                    Engagement Name
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
                                            <Button variant="ghost" onClick={() => requestSort('category')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                                <div className="flex justify-between items-center w-full">
                                                    Category
                                                    <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'category' ? 'opacity-100' : 'opacity-25')} />
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
                                            <Button variant="ghost" onClick={() => requestSort('lastActivity')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                                                <div className="flex justify-between items-center w-full">
                                                    Last Updated
                                                    <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'lastActivity' ? 'opacity-100' : 'opacity-25')} />
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
                                                <TableCell className="p-2">
                                                    <Checkbox
                                                        checked={selectedProjects.includes(project.id)}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectProject(project.id, checked as boolean)
                                                        }
                                                        aria-label={`Select ${project.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Button variant="ghost" size="icon" onClick={(e) => handleToggleStar(e, project)}>
                                                    <Star className={cn("h-4 w-4", project.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="font-medium p-2">
                                                <Link href={`/dashboard/projects/${project.id}`} className="hover:text-primary">
                                                        {project.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Link href={`/dashboard/companies/${project.companyId}/details`} className="hover:text-primary">
                                                        {project.companyName}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Badge variant={statusBadgeVariant(project.status)}>
                                                        {project.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-2">{project.category}</TableCell>
                                                <TableCell className="p-2">
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
                                                <TableCell className="p-2">
                                                    {formatDate(project.lastActivity)}
                                                </TableCell>
                                                <TableCell className="text-right p-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => openEditProjectDialog(project)}>Edit Engagement</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => openDeleteDialog(project)}
                                                                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
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
                                            <TableCell colSpan={9} className="h-24 text-center">
                                                No engagements found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {loading ? (
                            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
                        ) : currentVisibleProjects.length > 0 ? (
                            currentVisibleProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="cursor-pointer hover:border-primary transition-colors flex flex-col group"
                                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-start">
                                            <span className="line-clamp-1">{project.name}</span>
                                            <Badge variant={statusBadgeVariant(project.status)}>
                                            {project.status}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>{project.companyName}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                                        {project.description}
                                    </p>
                                    </CardContent>
                                    <CardFooter className="flex-col items-start gap-2 pt-4">
                                        <div className="flex justify-between w-full text-xs text-muted-foreground">
                                            <span>Progress</span>
                                            <span>{Math.round((project as any).progress)}%</span>
                                        </div>
                                        <Progress value={(project as any).progress} className="h-2" />
                                        <div className="flex justify-between w-full text-xs text-muted-foreground pt-2">
                                            <span>Owner: {project.owner}</span>
                                            <span>Updated: {formatDate(project.lastActivity)}</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <p className="text-muted-foreground col-span-full text-center py-8">
                                No engagements found
                            </p>
                        )}
                        <Card
                            className="cursor-pointer bg-transparent border-dashed hover:border-primary transition-colors flex flex-col items-center justify-center min-h-[260px] border-2 border-border"
                            onClick={openNewProjectDialog}
                        >
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <PlusCircle className="w-12 h-12 text-[hsl(0_0%_75%)] dark:text-foreground/10" />
                                <p className="text-sm text-[hsl(0_0%_75%)] dark:text-foreground/10">New Engagement</p>
                            </div>
                        </Card>
                    </div>
                )}

                {viewMode === 'list' && (
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
                )}
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
                This action cannot be undone. This will permanently delete the selected engagements.
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
        
        <AlertDialog open={isDependencyErrorDialogOpen} onOpenChange={setIsDependencyErrorDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cannot Delete Engagement</AlertDialogTitle>
                    <AlertDialogDescription>
                        {dependencyErrorDialogMessage}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsDependencyErrorDialogOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </div>
    </>
  );
}
