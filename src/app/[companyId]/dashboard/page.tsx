'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import React from "react";

export default function CompanyDashboardPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [companyName, setCompanyName] = React.useState('');

  React.useEffect(() => {
    if (companyId) {
      // Capitalize the first letter and replace hyphens with spaces
      const formattedName = companyId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCompanyName(formattedName);
    }
  }, [companyId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard for {companyName}</h1>
          <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Assessments</CardTitle>
            <CardDescription>Your ongoing evaluations.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports Generated</CardTitle>
            <CardDescription>Insights compiled this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Collaborators on your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">4</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
