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
import { Phone, Globe, MapPin, ArrowLeft, Plus, Pencil } from 'lucide-react';
import type { Company } from '@/services/company-service';
import { getCompany, updateCompany } from '@/services/company-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AssessmentModal } from '@/components/assessment-modal';
import { EditCompanyModal } from '@/components/edit-company-modal';

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
  const [companyData, setCompanyData] = React.useState<Company | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const fetchCompany = React.useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const data = await getCompany(companyId);
      if (data) {
        setCompanyData(data);
      } else {
        console.error("Company not found");
        setCompanyData(null);
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleAssessmentSelect = () => {
    setIsAssessmentModalOpen(true);
  };

  const handleCompanyUpdate = async (updatedData: Partial<Company>) => {
    if (!companyId) return;
    await updateCompany(companyId, updatedData);
    await fetchCompany(); // Refetch to show updated data
    setIsEditModalOpen(false);
  };

  if (loading) {
      return (
        <AppLayout>
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-56 w-full" />
                        <Skeleton className="h-56 w-full" />
                    </div>
                </div>
            </div>
        </AppLayout>
      );
  }

  if (!companyData) {
      return (
        <AppLayout>
            <div className="flex justify-center items-center h-full">
                <p>Company not found.</p>
            </div>
        </AppLayout>
      );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-4">
             <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/companies">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Companies</span>
                </Link>
             </Button>
            <h1 className="text-3xl font-bold">{companyData.name}</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            A complete overview of {companyData.name}.
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
                  {companyData.name} is a leading provider of innovative solutions in the tech industry. They are focused on developing cutting-edge products that solve real-world problems. With a strong team of experts and a commitment to customer success, they have established themselves as a trusted partner for businesses worldwide.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Current Assessments</CardTitle>
                  <CardDescription>
                    Ongoing assessments for {companyData.name}.
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">New Assessment</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={handleAssessmentSelect}>
                      RevOps Maturity
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleAssessmentSelect}>
                      GTM Strategy Alignment
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleAssessmentSelect}>
                      Tech Stack ROI Analysis
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Company Information</CardTitle>
                    <Button variant="outline" size="icon" onClick={() => setIsEditModalOpen(true)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Company</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{`${companyData.street}, ${companyData.city}, ${companyData.state} ${companyData.zip}`}</span>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{companyData.phone}</span>
                    </div>
                     <div className="flex items-center gap-4">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <a href={`http://${companyData.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                            {companyData.website}
                        </a>
                    </div>
                </CardContent>
            </Card>
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
      <AssessmentModal isOpen={isAssessmentModalOpen} onOpenChange={setIsAssessmentModalOpen} />
      {companyData && (
        <EditCompanyModal 
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            company={companyData}
            onSave={handleCompanyUpdate}
        />
      )}
    </AppLayout>
  );
}
