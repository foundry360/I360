'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import React from "react";
import { getCompany } from "@/services/company-service";
import type { Company } from "@/services/company-service";

export default function CompanyDashboardPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [company, setCompany] = React.useState<Company | null>(null);
  const [greeting, setGreeting] = React.useState('');

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  React.useEffect(() => {
    if (companyId) {
      getCompany(companyId).then(data => {
        setCompany(data);
      });
    }
  }, [companyId]);

  const getFirstName = () => {
    if (company?.contact?.name) {
      return company.contact.name.split(' ')[0];
    }
    return 'User';
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {getFirstName()} 👋</h1>
          <p className="text-muted-foreground">Welcome to Insights360</p>
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
