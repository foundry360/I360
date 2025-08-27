'use client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/app-layout';
import { useParams } from 'next/navigation';
import React from 'react';
import { Progress } from '@/components/ui/progress';

const currentAssessments = [
    { name: 'Q4 2023 RevOps Maturity', status: 'In Progress', progress: 75, startDate: '2023-10-01' },
    { name: 'GTM Strategy Alignment', status: 'In Progress', progress: 40, startDate: '2023-10-10' },
    { name: 'Tech Stack ROI Analysis', status: 'Not Started', progress: 0, startDate: '2023-11-01' },
];

const assessmentHistory = [
  {
    name: 'Q3 2023 GTM Strategy Review',
    status: 'Completed',
    date: '2023-09-15',
  },
  {
    name: 'Sales Team Performance Analysis',
    status: 'Completed',
    date: '2023-08-22',
  },
  {
    name: 'New Product Launch Readiness',
    status: 'Completed',
    date: '2023-10-05',
  },
  {
    name: 'Market Expansion Feasibility',
    status: 'Completed',
    date: '2023-07-30',
  },
];

const primaryContacts = [
  { name: 'Jane Doe', role: 'CEO', avatar: 'https://picsum.photos/100/100' },
  {
    name: 'John Smith',
    role: 'Head of Sales',
    avatar: 'https://picsum.photos/100/100',
  },
  {
    name: 'Emily Johnson',
    role: 'Marketing Director',
    avatar: 'https://picsum.photos/100/100',
  },
];

const recentActivity = [
    { activity: 'New assessment "Q4 Planning" started', time: '2 hours ago' },
    { activity: 'Jane Doe added as primary contact', time: '1 day ago' },
    { activity: 'Report generated for "Sales Team Performance"', time: '3 days ago' },
    { activity: 'Company profile updated', time: '1 week ago' },
];

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [companyName, setCompanyName] = React.useState('');

  React.useEffect(() => {
    if (companyId) {
      const formattedName = companyId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCompanyName(formattedName);
    }
  }, [companyId]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Company Details</h1>
          <p className="text-muted-foreground">
            A complete overview of {companyName}.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {companyName} is a leading provider of innovative solutions in the tech industry. They are focused on developing cutting-edge products that solve real-world problems. With a strong team of experts and a commitment to customer success, they have established themselves as a trusted partner for businesses worldwide.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Current Assessments</CardTitle>
                <CardDescription>
                  Ongoing assessments for {companyName}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[150px]">Progress</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAssessments.map((assessment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {assessment.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assessment.status === 'In Progress'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <Progress value={assessment.progress} className="h-2" />
                        </TableCell>
                        <TableCell>{assessment.startDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>
                  Review of all completed assessments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessmentHistory.map((assessment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {assessment.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assessment.status === 'Completed'
                                ? 'default'
                                : 'secondary'
                            }
                            className={assessment.status === 'Completed' ? 'bg-green-500' : ''}
                          >
                            {assessment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{assessment.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primaryContacts.map((contact, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={contact.avatar} data-ai-hint="person" />
                      <AvatarFallback>
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.role}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div>
                        <p className="font-medium text-sm">{item.activity}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                    </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
