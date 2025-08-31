
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import React from "react";
import { getCompany } from "@/services/company-service";
import type { Company } from "@/services/company-service";
import { useUser } from "@/contexts/user-context";

export default function CompanyDashboardPage() {
  const params = useParams();
  const { user } = useUser();
  const companyId = params.companyId as string;
  const [company, setCompany] = React.useState<Company | null>(null);
  const [greeting, setGreeting] = React.useState('');
  const [loading, setLoading] = React.useState(true);

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

    if (companyId) {
      setLoading(true);
      getCompany(companyId).then(data => {
        setCompany(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [companyId]);

  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'User';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{greeting ? `${greeting}, ${getFirstName()} 👋` : `Welcome, ${getFirstName()} 👋`}</h1>
          {company ? (
            <p className="text-muted-foreground">Viewing dashboard for {company.name}</p>
          ) : (
            <p className="text-muted-foreground">Welcome to your dashboard.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Assessments</CardTitle>
            <CardDescription>Your ongoing evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports Generated</CardTitle>
            <CardDescription>Insights compiled this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Collaborators on your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">4</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
