
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
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getProjects, Project } from '@/services/project-service';
import { useUser } from '@/contexts/user-context';

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { openNewProjectDialog, setOnProjectCreated } = useQuickAction();
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
    const unsubscribe = setOnProjectCreated(() => fetchProjects);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchProjects, setOnProjectCreated]);
  
  const getDisplayName = (email: string | null | undefined) => {
    if(!email) return 'N/A';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'On Hold');
  const inactiveProjects = projects.filter(p => p.status === 'Completed' || p.status === 'Inactive');

  const renderProjectTable = (projectList: Project[], title: string, description: string, showAddButton: boolean) => (
     <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
            {showAddButton && (
                <Button size="sm" onClick={openNewProjectDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </Button>
            )}
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectList.length > 0 ? (
                            projectList.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">{project.name}</TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/companies/${project.companyId}/details`} className="hover:text-primary">
                                            {project.companyName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{project.owner || getDisplayName(user?.email)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete Project</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          Manage and track all projects across your companies.
        </p>
      </div>
      <Separator />

      <div className="space-y-8">
        {renderProjectTable(activeProjects, 'Active Projects', 'Projects that are currently in progress or on hold.', true)}
        {renderProjectTable(inactiveProjects, 'Inactive / Completed Projects', 'Projects that have been completed or are no longer active.', false)}
      </div>
    </div>
  );
}
