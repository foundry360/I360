
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
  Bell,
  CheckCheck,
  MessageCircleMore,
  Rss,
  ChevronDown,
  PlusCircle,
} from 'lucide-react';
import { getAssessments, type Assessment } from '@/services/assessment-service';
import { getContacts, type Contact } from '@/services/contact-service';
import { type BacklogItem, BacklogItemStatus } from '@/services/backlog-item-service';
import { formatDistanceToNow, parseISO, isWithinInterval, addDays, format, differenceInDays, isPast } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { EngagementInsightsPanel } from '@/components/engagement-insights-panel';
import { getNotifications, markAllNotificationsAsRead, type Notification } from '@/services/notification-service';
import { FeedItem } from '@/components/feed-item';
import { useQuickAction } from '@/contexts/quick-action-context';
import type { Project } from '@/services/project-service';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type ActivityItem = {
  id: string;
  type: 'Engagement' | 'Assessment' | 'Contact';
  message: string;
  timestamp: string;
  icon: React.ElementType;
  link: string;
};

type ProjectWithProgress = Project & { progress: number };

const activityTypeConfig: Record<ActivityItem['type'], { icon: React.ElementType, color: string, bg: string }> = {
  Engagement: { icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  Assessment: { icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  Contact: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
};

const statusColors: Record<BacklogItemStatus, string> = {
    'To Do': 'bg-muted-foreground/20 text-muted-foreground',
    'In Progress': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    'In Review': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    'Needs Revision': 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    'Final Approval': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    'Complete': 'bg-green-500/20 text-green-600 dark:text-green-400',
};


export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const { backlogItems, projects, getProjects, openNewProjectDialog } = useQuickAction();
  const [greeting, setGreeting] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [recentEngagements, setRecentEngagements] = React.useState<ProjectWithProgress[]>(
    []
  );
  const [thisWeeksItems, setThisWeeksItems] = React.useState<BacklogItem[]>([]);
  const [allRecentActivity, setAllRecentActivity] = React.useState<ActivityItem[]>(
    []
  );
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isActivityExpanded, setIsActivityExpanded] = React.useState(false);
  const [isTasksExpanded, setIsTasksExpanded] = React.useState(false);
  const [isTopSectionOpen, setIsTopSectionOpen] = React.useState(true);

  const loadDashboardData = React.useCallback(async () => {
    try {
        const [assessments, contacts, notificationsData] = await Promise.all([
            getAssessments(),
            getContacts(),
            getNotifications(),
        ]);
        setNotifications(notificationsData);

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
            parseISO(b.timestamp).getTime() -
            parseISO(a.timestamp).getTime()
        );
        setAllRecentActivity(allActivities);
        
        const projectsWithProgress: ProjectWithProgress[] = projects.map((project) => {
            const projectItems = backlogItems.filter(item => item.projectId === project.id);
            const totalItems = projectItems.length;
            const completedItems = projectItems.filter(t => t.status === 'Complete').length;
            const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            return { ...project, progress };
        });

        const sortedProjects = projectsWithProgress.sort(
            (a, b) =>
                parseISO(b.lastActivity || '1970-01-01').getTime() -
                parseISO(a.lastActivity || '1970-01-01').getTime()
        );
        setRecentEngagements(sortedProjects.slice(0, 10));

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sevenDaysFromNow = addDays(today, 7);
        sevenDaysFromNow.setHours(23, 59, 59, 999);

        const upcomingItems = backlogItems.filter(item => {
            if (!item.dueDate) return false;
            let dueDate;
            if (item.dueDate.includes('T')) {
                dueDate = new Date(item.dueDate);
            } else {
                dueDate = new Date(item.dueDate + 'T00:00:00');
            }
            if (isNaN(dueDate.getTime())) return false;
            const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            return dueDateOnly >= today && dueDateOnly <= sevenDaysFromNow;
        });
        setThisWeeksItems(upcomingItems);


    } catch (error) {
        console.error('Failed to fetch dashboard metadata', error);
    } finally {
        setLoading(false);
    }
  }, [projects, backlogItems]);

  React.useEffect(() => {
    getProjects();
  }, [getProjects]);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);
  
  const recentActivity = isActivityExpanded ? allRecentActivity : allRecentActivity.slice(0, 3);
  const visibleItems = isTasksExpanded ? thisWeeksItems : thisWeeksItems.slice(0, 5);
  
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
  
  const getItemRiskStatus = (item: BacklogItem): 'at-risk' | 'due-soon' | 'on-track' => {
      if (!item.dueDate) return 'on-track';
      const dueDate = parseISO(item.dueDate);
      if (isPast(dueDate)) return 'at-risk';
      const daysUntilDue = differenceInDays(dueDate, new Date());
      if (daysUntilDue <= 3) return 'due-soon';
      return 'on-track';
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1"><Skeleton className="h-64 w-full" /></div>
          <div className="lg:col-span-1"><Skeleton className="h-64 w-full" /></div>
          <div className="lg:col-span-1"><Skeleton className="h-64 w-full" /></div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <Collapsible open={isTopSectionOpen} onOpenChange={setIsTopSectionOpen}>
        <div className="flex justify-end">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="mb-4">
                    <ChevronDown className={cn("h-4 w-4 transition-transform", !isTopSectionOpen && "-rotate-90")} />
                    <span className="sr-only">{isTopSectionOpen ? 'Hide Overview' : 'Show Overview'}</span>
                </Button>
            </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className={cn("h-full", thisWeeksItems.length === 0 && 'p-10 rounded-lg border-2 border-dashed border-border bg-transparent shadow-none')}>
              {thisWeeksItems.length > 0 && (
                <CardHeader>
                      <CardTitle>Items Due This Week</CardTitle>
                      <CardDescription>
                          Your immediate priorities for the next 7 days
                      </CardDescription>
                  </CardHeader>
              )}
                <CardContent className={cn(thisWeeksItems.length === 0 && 'flex items-center justify-center h-full')}>
                    {thisWeeksItems.length > 0 ? (
                        <div className="space-y-0">
                            {visibleItems.map((item, index) => {
                                const riskStatus = getItemRiskStatus(item);
                                return (
                                    <div key={item.id} className={cn("flex items-start justify-between py-2 rounded-md hover:bg-muted cursor-pointer", index !== visibleItems.length - 1 && 'border-b dark:border-white/10')} onClick={() => router.push(`/dashboard/projects/${item.projectId}`)}>
                                        <div className="flex items-center gap-3 w-full">
                                            <div 
                                              className={cn(
                                                "h-2.5 w-2.5 rounded-full mt-1.5",
                                                riskStatus === 'at-risk' && 'bg-red-500',
                                                riskStatus === 'due-soon' && 'bg-yellow-500',
                                                riskStatus === 'on-track' && 'bg-green-500'
                                              )}
                                            />
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex justify-between items-center gap-2">
                                                    <p className="font-medium text-sm truncate">{item.title}</p>
                                                    <Badge variant="outline" className={cn("font-normal whitespace-nowrap", statusColors[item.status])}>{item.status}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Due on {format(parseISO(item.dueDate!), 'EEE, MMM dd')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {thisWeeksItems.length > 5 && (
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
                        <div className="text-center">
                             <div className="flex justify-center mb-4">
                               <div className="flex justify-center items-center h-16 w-16 text-muted-foreground">
                                   <CalendarCheck className="h-8 w-8" />
                               </div>
                           </div>
                            <h3 className="font-semibold text-foreground">All clear for the week!</h3>
                            <p className="text-muted-foreground mt-2">No items are due in the next 7 days.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card className={cn("h-full", allRecentActivity.length === 0 && 'p-10 rounded-lg border-2 border-dashed border-border bg-transparent shadow-none')}>
              {allRecentActivity.length > 0 && (
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    The latest updates from your workspace
                  </CardDescription>
                </CardHeader>
              )}
              <CardContent className={cn(allRecentActivity.length === 0 && 'flex items-center justify-center h-full')}>
                {allRecentActivity.length > 0 ? (
                    <>
                        <div className="relative space-y-0">
                        {recentActivity.map((item, index) => {
                            const config = activityTypeConfig[item.type];
                            const Icon = config.icon;
                            return (
                            <div
                                key={`${item.id}-${index}`}
                                className="flex gap-4 group"
                                onClick={() => item.link && router.push(item.link)}
                            >
                                <div className="relative flex flex-col items-center">
                                <div className={cn("p-2 rounded-full z-10 relative", config.bg)}>
                                    <Icon className={cn("h-5 w-5", config.color)} />
                                </div>
                                {index < recentActivity.length - 1 && (
                                    <div className="flex-grow w-px bg-primary/20" />
                                )}
                                </div>
                                
                                <div className="flex-1 py-1 group-hover:bg-muted rounded-md px-2 -mx-2 flex justify-between items-start cursor-pointer">
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
                        {allRecentActivity.length > 3 && (
                            <Button 
                                variant="link" 
                                className="p-0 h-auto text-sm mt-4"
                                onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                            >
                                {isActivityExpanded ? 'View less' : 'View all'}
                            </Button>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                       <div className="flex justify-center mb-4">
                           <div className="flex justify-center items-center h-16 w-16 text-muted-foreground">
                               <FolderKanban className="h-8 w-8" />
                           </div>
                       </div>
                        <h3 className="font-semibold text-foreground">No recent activity</h3>
                        <p className="text-muted-foreground mt-2">Updates from your workspace will appear here.</p>
                    </div>
                )}
              </CardContent>
            </Card>
             <Card className={cn("group h-full flex flex-col", notifications.length === 0 && 'p-10 rounded-lg border-2 border-dashed border-border bg-transparent shadow-none')}>
                {notifications.length > 0 && (
                  <CardHeader>
                      <div className="flex items-center justify-between">
                          <CardTitle>
                          Communications Feed
                          </CardTitle>
                      </div>
                      <CardDescription>
                          A live feed of all notifications and alerts
                      </CardDescription>
                  </CardHeader>
                )}
                <CardContent className={cn("flex-1", notifications.length === 0 && 'flex flex-col items-center justify-center')}>
                {notifications.length > 0 ? (
                    <div className="space-y-0">
                      {notifications.slice(0, 3).map(note => (
                          <FeedItem
                              key={note.id}
                              notification={note}
                              isSelected={false}
                              onSelect={() => {}}
                              onUpdate={() => getNotifications().then(setNotifications)}
                              showActions={true}
                              showCheckbox={false}
                          />
                      ))}
                    </div>
                ) : (
                    <div className="text-center">
                       <div className="flex justify-center mb-4">
                           <div className="flex justify-center items-center h-16 w-16 text-muted-foreground">
                               <Rss className="h-8 w-8" />
                           </div>
                       </div>
                       <h3 className="font-semibold text-foreground">Inbox Zero!</h3>
                       <p className="text-muted-foreground mt-2">No new notifications.</p>
                    </div>
                )}
              </CardContent>
              {notifications.length > 3 && (
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/feed')}>View all in Feed</Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>


      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Engagements</h2>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Zap className="mr-2 h-4 w-4"/>
                  Insights
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[1000px] sm:max-w-none sm:w-[1280px] p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
                <EngagementInsightsPanel projects={recentEngagements.filter(p => p.status === 'Active')} />
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={() => router.push('/dashboard/projects')}>
              View All
            </Button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recentEngagements.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-primary transition-colors flex flex-col min-h-[260px]"
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
          }
            <Card
                className="cursor-pointer bg-transparent border-dashed hover:border-primary transition-colors flex flex-col items-center justify-center min-h-[260px] border-2 border-border"
                onClick={openNewProjectDialog}
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <PlusCircle className="w-12 h-12 text-[hsl(0_0%_75%)] dark:text-[hsl(214_10%_31%)]" />
                  <p className="text-sm text-[hsl(0_0%_75%)] dark:text-[hsl(214_10%_31%)]">New Engagement</p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}

    