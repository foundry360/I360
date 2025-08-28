'use client';
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle
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
import { getAssessmentsForCompany, type Assessment } from '@/services/assessment-service';
import { cn } from '@/lib/utils';

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
    { activity: 'New assessment "Q4 Planning" started', time: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { activity: 'Jane Doe added as primary contact', time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { activity: 'Report generated for "Sales Team Performance"', time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { activity: 'Company profile updated', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
];

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [companyData, setCompanyData] = React.useState<Company | null>(null);
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [assessmentToResume, setAssessmentToResume] = React.useState<Assessment | null>(null);

  const fetchCompanyData = React.useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const companyPromise = getCompany(companyId);
      const assessmentsPromise = getAssessmentsForCompany(companyId);
      const [company, companyAssessments] = await Promise.all([companyPromise, assessmentsPromise]);
      
      if (company) {
        setCompanyData(company);
      } else {
        console.error("Company not found");
        setCompanyData(null);
      }
      setAssessments(companyAssessments);
    } catch (error) {
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleAssessmentSelect = () => {
    setAssessmentToResume(null);
    setIsAssessmentModalOpen(true);
  };
  
  const handleResumeAssessment = (assessment: Assessment) => {
    if (assessment.status === 'In Progress') {
      setAssessmentToResume(assessment);
      setIsAssessmentModalOpen(true);
    }
  }

  const handleCompanyUpdate = async (updatedData: Partial<Company>) => {
    if (!companyId) return;
    await updateCompany(companyId, updatedData);
    await fetchCompanyData(); // Refetch to show updated data
    setIsEditModalOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Company Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {companyData.name} is a leading provider of innovative solutions in the tech industry. They are focused on developing cutting-edge products that solve real-world problems. With a strong team of experts and a commitment to customer success, they have established themselves as a trusted partner for businesses worldwide.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Current Assessments</CardTitle>
                  <CardDescription>
                    Ongoing assessments for {companyData.name}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={handleAssessmentSelect}>
                      GTM Readiness
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
                    {assessments.map((assessment, index) => (
                      <TableRow 
                        key={index}
                        onClick={() => handleResumeAssessment(assessment)}
                        className={cn(
                          assessment.status === 'In Progress' && 'cursor-pointer'
                        )}
                      >
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
                        <TableCell>{new Date(assessment.startDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Assessment History</CardTitle>
                <CardDescription>
                  Review of all completed assessments
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
                    <CardTitle className="text-xl">Company Information</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                        <Pencil className="h-4 w-4" />
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
                <CardTitle className="text-xl">Primary Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primaryContacts.map((contact, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.role}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div>
                        <p className="font-medium text-sm">{item.activity}</p>
                        <p className="text-xs text-muted-foreground">{item.time.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZoneName: 'short' })}</p>
                        </div>
                    </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AssessmentModal 
        isOpen={isAssessmentModalOpen} 
        onOpenChange={(isOpen) => {
            if (!isOpen) setAssessmentToResume(null);
            setIsAssessmentModalOpen(isOpen);
        }} 
        onAssessmentComplete={fetchCompanyData}
        assessmentToResume={assessmentToResume}
      />
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

    
