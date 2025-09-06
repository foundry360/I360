
'use client';
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Phone, Globe, MapPin, ArrowLeft, Plus, Pencil, FileText, Trash2, Paperclip, Upload, Link2, FolderKanban, Star } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditCompanyModal } from '@/components/edit-company-modal';
import { getAssessmentsForCompany, type Assessment, deleteAssessments, uploadAssessmentDocument, updateAssessment } from '@/services/assessment-service';
import { getContactsForCompany, type Contact } from '@/services/contact-service';
import { getProjectsForCompany, type Project } from '@/services/project-service';
import { cn } from '@/lib/utils';
import { useQuickAction } from '@/contexts/quick-action-context';
import { Checkbox } from '@/components/ui/checkbox';
import { TablePagination } from '@/components/table-pagination';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

type ActivityItem = {
    activity: string;
    time: Date;
};

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const companyId = params.companyId as string;
  const { openAssessmentModal, setOnAssessmentCompleted, openNewContactDialog, setOnContactCreated, openNewProjectDialog, setOnProjectCreated } = useQuickAction();
  const [companyData, setCompanyData] = React.useState<Company | null>(null);
  const [currentAssessments, setCurrentAssessments] = React.useState<Assessment[]>([]);
  const [completedAssessments, setCompletedAssessments] = React.useState<Assessment[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [allRecentActivity, setAllRecentActivity] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [isActivityExpanded, setIsActivityExpanded] = React.useState(false);
  const [selectedAssessments, setSelectedAssessments] = React.useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [assessmentToUpload, setAssessmentToUpload] = React.useState<string | null>(null);

  const fetchCompanyData = React.useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const companyPromise = getCompany(companyId);
      const assessmentsPromise = getAssessmentsForCompany(companyId);
      const contactsPromise = getContactsForCompany(companyId);
      const projectsPromise = getProjectsForCompany(companyId);

      const [company, allAssessments, companyContacts, companyProjects] = await Promise.all([
          companyPromise, 
          assessmentsPromise, 
          contactsPromise,
          projectsPromise
      ]);
      
      setCompanyData(company);
      setProjects(companyProjects);
      
      const current = allAssessments.filter(a => a.status === 'In Progress');
      const completed = allAssessments.filter(a => a.status === 'Completed').sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      setCurrentAssessments(current);
      setCompletedAssessments(completed);
      setContacts(companyContacts);

      if (company) {
          const assessmentActivity: ActivityItem[] = allAssessments.map(a => ({
              activity: `Assessment "${a.name}" status: ${a.status}`,
              time: new Date(a.startDate),
          }));

          const contactActivity: ActivityItem[] = companyContacts.map(c => ({
              activity: `Contact "${c.name}" added.`,
              time: new Date(c.lastActivity),
          }));
      
          const companyUpdateActivity = {
              activity: "Company profile updated",
              time: new Date(company.lastActivity)
          };
           const allActivity = [...assessmentActivity, ...contactActivity, companyUpdateActivity]
            .sort((a, b) => b.time.getTime() - a.time.getTime());
           setAllRecentActivity(allActivity);
      } else {
        console.error("Company not found");
        setAllRecentActivity([]);
      }

    } catch (error) {
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  React.useEffect(() => {
    fetchCompanyData();
    const unsubscribeAssessment = setOnAssessmentCompleted(() => fetchCompanyData);
    const unsubscribeContact = setOnContactCreated(() => fetchCompanyData);
    const unsubscribeProject = setOnProjectCreated(() => fetchCompanyData);

    return () => {
      if (typeof unsubscribeAssessment === 'function') unsubscribeAssessment();
      if (typeof unsubscribeContact === 'function') unsubscribeContact();
      if (typeof unsubscribeProject === 'function') unsubscribeProject();
    }
  }, [fetchCompanyData, setOnAssessmentCompleted, setOnContactCreated, setOnProjectCreated]);
  
  const handleOpenAssessment = (assessment: Assessment) => {
    if (assessment.status === 'Completed') {
        router.push(`/assessment/${assessment.id}/report`);
    } else {
        openAssessmentModal(assessment);
    }
  }

  const handleCompanyUpdate = async (updatedData: Partial<Company>) => {
    if (!companyId) return;
    await updateCompany(companyId, { ...updatedData, lastActivity: new Date().toISOString() });
    await fetchCompanyData(); // Refetch to show updated data
    setIsEditModalOpen(false);
  };
  
  const handleUploadClick = (assessmentId: string) => {
    setAssessmentToUpload(assessmentId);
    fileInputRef.current?.click();
  };
  
  const handleToggleStar = async (e: React.MouseEvent, assessment: Assessment) => {
    e.stopPropagation();
    await updateAssessment(assessment.id, { isStarred: !assessment.isStarred });
    await fetchCompanyData();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && assessmentToUpload) {
      try {
        setLoading(true);
        await uploadAssessmentDocument(assessmentToUpload, file);
        toast({
            title: "Upload Successful",
            description: `${file.name} has been attached to the assessment.`,
        });
        await fetchCompanyData(); // Refresh data to show new document link
      } catch (error) {
        console.error("Failed to upload document:", error);
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "There was a problem uploading your document.",
        });
      } finally {
        setLoading(false);
        setAssessmentToUpload(null);
        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleCopyLink = () => {
    if (!companyId) return;
    const url = `${window.location.origin}/public/assessment/${companyId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Assessment link has been copied to your clipboard.",
    });
  };


  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const handleSelectAssessment = (assessmentId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAssessments((prev) => [...prev, assessmentId]);
    } else {
      setSelectedAssessments((prev) => prev.filter((id) => id !== assessmentId));
    }
  };

  const handleSelectAllAssessments = (isSelected: boolean) => {
    const currentVisibleIds = paginatedAssessments.map((a) => a.id);
    if (isSelected) {
       setSelectedAssessments((prev) => [...new Set([...prev, ...currentVisibleIds])]);
    } else {
      setSelectedAssessments((prev) => prev.filter((id) => !currentVisibleIds.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteAssessments(selectedAssessments);
      setSelectedAssessments([]);
      setIsBulkDeleteDialogOpen(false);
      await fetchCompanyData(); // Refetch data
    } catch (error) {
      console.error('Failed to delete assessments:', error);
    }
  };

  const paginatedAssessments = completedAssessments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const allOnPageSelected = paginatedAssessments.length > 0 && paginatedAssessments.every(a => selectedAssessments.includes(a.id));
  const isAssessmentIndeterminate = paginatedAssessments.some(a => selectedAssessments.includes(a.id)) && !allOnPageSelected;

  const recentActivity = isActivityExpanded ? allRecentActivity : allRecentActivity.slice(0, 5);

  const formatDate = (isoDate: string) => {
    if (!isoDate) return 'N/A';
    return format(parseISO(isoDate), 'MMM dd, yyyy');
  };

  const formatDateTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  if (loading && !companyData) {
      return (
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
      );
  }

  if (!companyData) {
      return (
            <div className="flex justify-center items-center h-full">
                <p>Company not found.</p>
            </div>
      );
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
      />
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               <Button asChild variant="outline" size="icon">
                  <Link href="/dashboard/companies">
                      <ArrowLeft className="h-4 w-4" />
                      <span className="sr-only">Back to Companies</span>
                  </Link>
               </Button>
              <h1 className="text-3xl font-bold">{companyData.name}</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy Assessment Link
                </Button>
                <Button variant="outline" size="icon" onClick={() => setIsEditModalOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Company</span>
                </Button>
            </div>
          </div>
        </div>
        <Separator className="my-4" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Company Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    'text-sm text-muted-foreground',
                    !isDescriptionExpanded && 'line-clamp-2'
                  )}
                >
                  {companyData.description}
                </p>
                {companyData.description &&
                  companyData.description.length > 150 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto mt-2 text-sm"
                      onClick={() =>
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }
                    >
                      {isDescriptionExpanded ? 'Read less' : 'Read more'}
                    </Button>
                  )}
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
                    <DropdownMenuItem onSelect={() => openAssessmentModal()}>
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
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[150px]">Progress</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAssessments.length > 0 ? (
                      currentAssessments.map((assessment, index) => (
                        <TableRow 
                          key={index}
                          onClick={() => handleOpenAssessment(assessment)}
                          className="cursor-pointer"
                        >
                          <TableCell className="font-medium">
                            {assessment.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={(assessment.type || 'GTM Readiness') === 'GTM Readiness' ? 'default' : 'secondary'}>
                              {assessment.type || 'GTM Readiness'}
                            </Badge>
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
                          <TableCell>{formatDate(assessment.startDate)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No assessments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Assessment History</CardTitle>
                    <CardDescription>
                      Review of all completed assessments
                    </CardDescription>
                  </div>
                   {selectedAssessments.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBulkDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedAssessments.length})
                      </Button>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={allOnPageSelected}
                          onCheckedChange={(checked) =>
                            handleSelectAllAssessments(checked as boolean)
                          }
                          aria-label="Select all assessments on page"
                          data-state={isAssessmentIndeterminate ? 'indeterminate' : (allOnPageSelected ? 'checked' : 'unchecked')}
                        />
                      </TableHead>
                      <TableHead className="w-[50px]">
                        <Star className="h-4 w-4" />
                      </TableHead>
                      <TableHead>Assessment Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAssessments.length > 0 ? (
                      paginatedAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                           <TableCell>
                            <Checkbox
                              checked={selectedAssessments.includes(assessment.id)}
                              onCheckedChange={(checked) =>
                                handleSelectAssessment(assessment.id, checked as boolean)
                              }
                              aria-label={`Select ${assessment.name}`}
                            />
                          </TableCell>
                           <TableCell>
                              <Button variant="ghost" size="icon" onClick={(e) => handleToggleStar(e, assessment)}>
                                <Star className={cn("h-4 w-4", assessment.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                              </Button>
                           </TableCell>
                          <TableCell className="font-medium">
                            {assessment.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={(assessment.type || 'GTM Readiness') === 'GTM Readiness' ? 'default' : 'secondary'}>
                              {assessment.type || 'GTM Readiness'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                assessment.status === 'Completed'
                                  ? 'success'
                                  : 'outline'
                              }
                            >
                              {assessment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(assessment.startDate)}</TableCell>
                          <TableCell className="text-right">
                              {assessment.documentUrl && (
                                <Button asChild variant="ghost" size="icon" title="View Document">
                                    <a href={assessment.documentUrl} target="_blank" rel="noopener noreferrer">
                                        <Paperclip className="h-4 w-4" />
                                        <span className="sr-only">View Document</span>
                                    </a>
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleOpenAssessment(assessment)} title="View Report">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View Report</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleUploadClick(assessment.id)} title="Upload Document">
                                  <Upload className="h-4 w-4" />
                                  <span className="sr-only">Upload Document</span>
                              </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                       <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No assessments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4">
                    <TablePagination
                        count={completedAssessments.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(newPage) => setPage(newPage)}
                        onRowsPerPageChange={(newRowsPerPage) => {
                            setRowsPerPage(newRowsPerPage);
                            setPage(0);
                        }}
                    />
                </div>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Primary Contacts</CardTitle>
                 <Button variant="outline" size="sm" onClick={openNewContactDialog}>
                    <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-4">
                      <Avatar>
                         <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.title}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No contacts found for this company.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">Company Engagements</CardTitle>
                  <Button variant="outline" size="icon" onClick={openNewProjectDialog}>
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">New Engagement</span>
                  </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                  {projects.length > 0 ? (
                      projects.map(project => (
                        <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                          <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted cursor-pointer">
                              <div>
                                  <p className="font-medium text-sm">{project.name}</p>
                                  <p className="text-xs text-muted-foreground">{project.owner}</p>
                              </div>
                              <Badge variant={project.status === 'Active' ? 'success' : 'secondary'}>
                                  {project.status}
                              </Badge>
                          </div>
                        </Link>
                      ))
                  ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No engagements found for this company.</p>
                  )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                    recentActivity.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <div>
                            <p className="font-medium text-sm">{item.activity}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(item.time)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                )}
                {allRecentActivity.length > 5 && (
                    <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm"
                        onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                    >
                        {isActivityExpanded ? 'View less' : 'View all'}
                    </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {companyData && (
        <EditCompanyModal 
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            company={companyData}
            onSave={handleCompanyUpdate}
        />
      )}
       <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              {selectedAssessments.length} selected assessments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsBulkDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
