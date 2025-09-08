
'use client';
import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/contexts/user-context';
import {
  UserPlus,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  ClipboardList,
  CalendarCheck,
  Clock,
  Presentation,
  Zap,
  GanttChartSquare,
  Wrench,
  SearchCheck,
} from 'lucide-react';
import { getProjects, type Project } from '@/services/project-service';
import { getAssessments, type Assessment } from '@/services/assessment-service';
import { getContacts, type Contact } from '@/services/contact-service';
import { getTasks, type Task } from '@/services/task-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { formatDistanceToNow, parseISO, isWithinInterval, addDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type ActivityItem = {
  id: string;
  type: 'Engagement' | 'Assessment' | 'Contact';
  message: string;
  timestamp: string;
  icon: React.ElementType;
  link: string;
};

type ProjectWithProgress = Project & { progress: number };

type TaskType = Task['type'];

const taskTypeIcons: Record<TaskType, React.ElementType> = {
    Assessment: ClipboardList,
    Workshop: Presentation,
    Enablement: Zap,
    Planning: GanttChartSquare,
    Execution: Wrench,
    Review: SearchCheck,
};

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const { globalSearchTerm, setGlobalSearchTerm } = useQuickAction();
  const [greeting, setGreeting] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [recentEngagements, setRecentEngagements] = React.useState<ProjectWithProgress[]>(
    []
  );
  const [thisWeeksTasks, setThisWeeksTasks] = React.useState<Task[]>([]);
  const [allRecentActivity, setAllRecentActivity] = React.useState<ActivityItem[]>(
    []
  );
  const [isActivityExpanded, setIsActivityExpanded] = React.useState(false);
  const [isTasksExpanded, setIsTasksExpanded] = React.useState(false);


  React.useEffect(() => {
    // This effect runs only on the client, after hydration
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [projects, assessments, contacts, allTasks] = await Promise.all([
          getProjects(),
          getAssessments(),
          getContacts(),
          getTasks(),
        ]);
        
        const tasksByProject = allTasks.reduce((acc, task) => {
            if (!acc[task.projectId]) {
                acc[task.projectId] = [];
            }
            acc[task.projectId].push(task);
            return acc;
        }, {} as Record<string, Task[]>);
        
        const today = new Date();
        const nextWeek = addDays(today, 7);
        const weeklyTasks = allTasks.filter(task => {
            if (!task.dueDate) return false;
            return isWithinInterval(parseISO(task.dueDate), { start: today, end: nextWeek });
        }).sort((a,b) => parseISO(a.dueDate!).getTime() - parseISO(b.dueDate!).getTime());
        setThisWeeksTasks(weeklyTasks);

        const projectsWithProgress: ProjectWithProgress[] = projects.map(project => {
            const projectTasks = tasksByProject[project.id] || [];
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(t => t.status === 'Complete').length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            return { ...project, progress };
        });


        const projectActivities: ActivityItem[] = projects.map((p) => ({
          id: p.id,
          type: 'Engagement',
          message: `Engagement '${p.name}' was updated.`,
          timestamp: p.lastActivity || new Date().toISOString(),
          icon: FolderKanban,
          link: `/dashboard/projects/${p.id}`,
        }));

        const assessmentActivities: ActivityItem[] = assessments.map((a) => ({
          id: a.id,
          type: 'Assessment',
          message: `Assessment '${a.name}' status is ${a.status}.`,
          timestamp: a.lastActivity || a.startDate,
          icon: ClipboardList,
          link: a.status === 'Completed' ? `/assessment/${a.id}/report` : `/dashboard/assessments`,
        }));

        const contactActivities: ActivityItem[] = contacts.map((c) => ({
          id: c.id,
          type: 'Contact',
          message: `Contact '${c.name}' was added.`,
          timestamp: c.lastActivity,
          icon: UserPlus,
          link: `/dashboard/companies/${c.companyId}/details`,
        }));

        const allActivities = [
          ...projectActivities,
          ...assessmentActivities,
          ...contactActivities,
        ].sort(
          (a, b) =>
            parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()
        );
        setAllRecentActivity(allActivities);

        const sortedProjects = projectsWithProgress.sort(
          (a, b) =>
            parseISO(b.lastActivity || '1970-01-01').getTime() -
            parseISO(a.lastActivity || '1970-01-01').getTime()
        );
        setRecentEngagements(sortedProjects.slice(0, 10)); 
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);
  
  const recentActivity = isActivityExpanded ? allRecentActivity : allRecentActivity.slice(0, 5);
  const visibleTasks = isTasksExpanded ? thisWeeksTasks : thisWeeksTasks.slice(0, 5);

  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'User';
  };

  const statusBadgeVariant = (
    status: 'Active' | 'Inactive' | 'Completed' | 'On Hold'
  ) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'secondary';
      case 'On Hold':
        return 'warning';
      case 'Inactive':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-3"><Skeleton className="h-64 w-full" /></div>
          <div className="lg:col-span-2"><Skeleton className="h-64 w-full" /></div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting ? `${greeting}, ${getFirstName()} 👋` : `Welcome, ${getFirstName()} 👋`}
          </h1>
          <p className="text-muted-foreground">
            Here's a quick overview of your workspace
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
           <CardHeader>
                <CardTitle>Tasks Due This Week</CardTitle>
                <CardDescription>
                    Your immediate priorities for the next 7 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {thisWeeksTasks.length > 0 ? (
                    <div className="space-y-0">
                        {visibleTasks.map((task, index) => {
                            const Icon = taskTypeIcons[task.type];
                            return (
                                <div key={task.id} className={cn("flex items-center justify-between py-2 rounded-md hover:bg-muted cursor-pointer", index !== visibleTasks.length - 1 && 'border-b dark:border-white/10')} onClick={() => router.push(`/dashboard/projects/${task.projectId}`)}>
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-sm">{task.title}</p>
                                            <p className="text-xs text-muted-foreground">Due: {format(parseISO(task.dueDate!), 'EEE, MMM dd')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <Badge variant="outline">{task.status}</Badge>
                                         <Badge variant="secondary">{task.priority}</Badge>
                                    </div>
                                </div>
                            )
                        })}
                        {thisWeeksTasks.length > 5 && (
                             <Button 
                                variant="link" 
                                className="p-0 h-auto text-sm mt-2"
                                onClick={() => setIsTasksExpanded(!isTasksExpanded)}
                            >
                                {isTasksExpanded ? 'See Less' : 'See More...'}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                        <CalendarCheck className="h-12 w-12 mb-4" />
                        <h3 className="font-semibold">All clear for the week!</h3>
                        <p>No tasks are due in the next 7 days.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              The latest updates from your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {recentActivity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex gap-4 group"
                    onClick={() => item.link && router.push(item.link)}
                  >
                    <div className="relative flex flex-col items-center">
                       <div className="bg-primary/10 p-2 rounded-full z-10 relative">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {index < recentActivity.length - 1 && (
                         <div className="flex-grow w-px bg-primary/20" />
                       )}
                    </div>
                    
                    <div className="flex-1 pb-8 pt-1 group-hover:bg-muted rounded-md px-2 -mx-2 flex justify-between items-start cursor-pointer">
                      <div>
                        <p className="text-sm">{item.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(item.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                       <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
            {allRecentActivity.length > 5 && (
                <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm mt-4"
                    onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                >
                    {isActivityExpanded ? 'View less' : 'View all'}
                </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Engagements</h2>
          <Button variant="outline" onClick={() => router.push('/dashboard/projects')}>
            View All
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {recentEngagements.length > 0 ? (
            recentEngagements.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-primary transition-colors flex flex-col"
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
                <CardFooter className="flex-col items-start gap-1 pt-4">
                   <div className="flex justify-between w-full text-xs text-muted-foreground">
                       <span>Progress</span>
                       <span>{Math.round(project.progress)}%</span>
                   </div>
                   <Progress value={project.progress} className="h-2" />
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No engagements found
            </p>
          )}
        </div>
      </div>
    </div>
  );

    

    

    

    