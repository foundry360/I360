
'use client';
import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/contexts/user-context';
import { Input } from '@/components/ui/input';
import {
  Search,
  FolderKanban,
  ClipboardList,
  UserPlus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { getProjects, type Project } from '@/services/project-service';
import { getAssessments, type Assessment } from '@/services/assessment-service';
import { getContacts, type Contact } from '@/services/contact-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type ActivityItem = {
  id: string;
  type: 'Engagement' | 'Assessment' | 'Contact';
  message: string;
  timestamp: string;
  icon: React.ElementType;
  link: string;
};

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const { globalSearchTerm, setGlobalSearchTerm } = useQuickAction();
  const [greeting, setGreeting] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [recentEngagements, setRecentEngagements] = React.useState<Project[]>(
    []
  );
  const [allRecentActivity, setAllRecentActivity] = React.useState<ActivityItem[]>(
    []
  );
  const [isActivityExpanded, setIsActivityExpanded] = React.useState(false);


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
        const [projects, assessments, contacts] = await Promise.all([
          getProjects(),
          getAssessments(),
          getContacts(),
        ]);

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
          link: `/assessment/${a.id}/report`,
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

        const sortedProjects = projects.sort(
          (a, b) =>
            parseISO(b.lastActivity || '1970-01-01').getTime() -
            parseISO(a.lastActivity || '1970-01-01').getTime()
        );
        setRecentEngagements(sortedProjects.slice(0, 6)); // Limit to 6 recent engagements
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);
  
  const recentActivity = isActivityExpanded ? allRecentActivity : allRecentActivity.slice(0, 5);

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
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            Here's a quick overview of your workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="h-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Global Search</CardTitle>
            <CardDescription>
              Find companies, contacts, projects, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search everything..."
                className="pl-10 text-base"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Start typing to see results across the entire application.
            </p>
          </CardContent>
        </Card>
        <Card className="h-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              The latest updates from your workspace.
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentEngagements.length > 0 ? (
            recentEngagements.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-primary transition-colors"
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
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No engagements found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
