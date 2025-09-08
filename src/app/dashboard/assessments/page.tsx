
'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  getAssessments,
  deleteAssessments,
  Assessment,
  uploadAssessmentDocument,
  updateAssessment,
} from '@/services/assessment-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Plus, Trash2, ArrowUpDown, FileText, Upload, Paperclip, Search, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TablePagination } from '@/components/table-pagination';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useQuickAction } from '@/contexts/quick-action-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

type SortKey = keyof Assessment;

export default function AssessmentsPage() {
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = React.useState<Assessment | null>(
    null
  );
  const [selectedAssessments, setSelectedAssessments] = React.useState<string[]>(
    []
  );

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'startDate', direction: 'descending' });

  const { openAssessmentModal, setOnAssessmentCompleted, globalSearchTerm, setGlobalSearchTerm } = useQuickAction();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [assessmentToUpload, setAssessmentToUpload] = React.useState<string | null>(null);
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);

  const fetchAssessments = React.useCallback(async () => {
    try {
      setLoading(true);
      const assessmentsFromDb = await getAssessments();
      setAssessments(assessmentsFromDb);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAssessments();
    const unsubscribe = setOnAssessmentCompleted(() => fetchAssessments);
    
    const handleFocus = () => fetchAssessments();
    window.addEventListener('focus', handleFocus);
    
    return () => {
        if(unsubscribe) unsubscribe();
        window.removeEventListener('focus', handleFocus);
    }
  }, [fetchAssessments, setOnAssessmentCompleted]);
  
  React.useEffect(() => {
    if (globalSearchTerm) {
      setIsSearchVisible(true);
    }
  }, [globalSearchTerm]);

  React.useEffect(() => {
    return () => {
      if(window.location.pathname !== '/dashboard') {
          setGlobalSearchTerm('');
      }
    };
  }, [setGlobalSearchTerm]);


  const openDeleteDialog = (assessment: Assessment) => {
    setAssessmentToDelete(assessment);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenAssessment = (assessment: Assessment) => {
    if (assessment.status === 'Completed') {
        router.push(`/assessment/${assessment.id}/report`);
    } else {
        openAssessmentModal(assessment);
    }
  };

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    try {
      await deleteAssessments([assessmentToDelete.id]);
      setIsDeleteDialogOpen(false);
      setAssessmentToDelete(null);
      await fetchAssessments(); // Refetch assessments
    } catch (error) {
      console.error('Failed to delete assessment:', error);
    }
  };

  const handleSelectAssessment = (assessmentId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAssessments((prev) => [...prev, assessmentId]);
    } else {
      setSelectedAssessments((prev) => prev.filter((id) => id !== assessmentId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    const currentVisibleIds = sortedAssessments
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((c) => c.id);
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
      setIsDeleteDialogOpen(false);
      await fetchAssessments();
    } catch (error) {
      console.error('Failed to delete assessments:', error);
    }
  };

  const handleUploadClick = (assessmentId: string) => {
    setAssessmentToUpload(assessmentId);
    fileInputRef.current?.click();
  };
  
  const handleToggleStar = async (e: React.MouseEvent, assessment: Assessment) => {
    e.stopPropagation();
    await updateAssessment(assessment.id, { isStarred: !assessment.isStarred });
    await fetchAssessments();
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
        await fetchAssessments(); // Refresh data to show new document link
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
  
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAssessments = React.useMemo(() => {
    let sortableItems = [...assessments];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(assessment => 
        assessment.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        (assessment.companyName || '').toLowerCase().includes(globalSearchTerm.toLowerCase())
    );
  }, [assessments, sortConfig, globalSearchTerm]);


  const currentVisibleAssessments = sortedAssessments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const numSelected = selectedAssessments.length;
  const numSelectedOnPage = currentVisibleAssessments.filter(c => selectedAssessments.includes(c.id)).length;
  const allOnPageSelected = numSelectedOnPage > 0 && numSelectedOnPage === currentVisibleAssessments.length;
  const isPageIndeterminate = numSelectedOnPage > 0 && numSelectedOnPage < currentVisibleAssessments.length;

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
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">
            Manage and track all assessments in your system
          </p>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Total Records: {sortedAssessments.length}</div>
          <div className="flex items-center gap-2">
            {numSelected > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({numSelected})
              </Button>
            )}
            {isSearchVisible && (
               <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Search assessments..." 
                      className="pl-8 w-48 md:w-64"
                      value={globalSearchTerm}
                      onChange={(e) => setGlobalSearchTerm(e.target.value)}
                      autoFocus
                  />
               </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(!isSearchVisible)}>
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <Button size="icon" onClick={() => openAssessmentModal()}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">New Assessment</span>
            </Button>
          </div>
        </div>
        <div className="border rounded-lg">
            {loading ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] border-t border-b">
                      <Checkbox
                        checked={allOnPageSelected}
                        onCheckedChange={(checked) =>
                          handleSelectAll(checked as boolean)
                        }
                        aria-label="Select all on page"
                        data-state={isPageIndeterminate ? 'indeterminate' : (allOnPageSelected ? 'checked' : 'unchecked')}
                      />
                    </TableHead>
                    <TableHead className="w-[50px] border-t border-b">
                         <Button variant="ghost" onClick={() => requestSort('isStarred')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                            <Star className={cn("h-4 w-4", sortConfig?.key === 'isStarred' ? 'opacity-100' : 'opacity-25')} />
                         </Button>
                    </TableHead>
                    <TableHead className="border-t border-r border-b">
                      <Button variant="ghost" onClick={() => requestSort('name')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                        <div className="flex justify-between items-center w-full">
                          Assessment Name
                          <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'name' ? 'opacity-100' : 'opacity-25')} />
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="border-t border-r border-b">
                      <Button variant="ghost" onClick={() => requestSort('companyName')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                        <div className="flex justify-between items-center w-full">
                          Company
                          <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'companyName' ? 'opacity-100' : 'opacity-25')} />
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="border-t border-r border-b">
                      <Button variant="ghost" onClick={() => requestSort('type')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                        <div className="flex justify-between items-center w-full">
                          Type
                          <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'type' ? 'opacity-100' : 'opacity-25')} />
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="border-t border-r border-b">
                      <Button variant="ghost" onClick={() => requestSort('status')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                        <div className="flex justify-between items-center w-full">
                          Status
                          <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'status' ? 'opacity-100' : 'opacity-25')} />
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="border-t border-r border-b">
                      <Button variant="ghost" onClick={() => requestSort('startDate')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                        <div className="flex justify-between items-center w-full">
                          Date
                          <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'startDate' ? 'opacity-100' : 'opacity-25')} />
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="text-right border-t border-b"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVisibleAssessments.length > 0 ? (
                    currentVisibleAssessments.map((assessment) => (
                      <TableRow key={assessment.id} data-state={selectedAssessments.includes(assessment.id) && "selected"}>
                        <TableCell className="p-2">
                          <Checkbox
                            checked={selectedAssessments.includes(assessment.id)}
                            onCheckedChange={(checked) =>
                              handleSelectAssessment(assessment.id, checked as boolean)
                            }
                            aria-label={`Select ${assessment.name}`}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                            <Button variant="ghost" size="icon" onClick={(e) => handleToggleStar(e, assessment)}>
                                <Star className={cn("h-4 w-4", assessment.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                            </Button>
                        </TableCell>
                        <TableCell className="font-medium p-2">
                          <span onClick={() => handleOpenAssessment(assessment)} className="hover:text-primary cursor-pointer">
                            {assessment.name}
                          </span>
                        </TableCell>
                        <TableCell className="p-2">
                          <Link href={`/dashboard/companies/${assessment.companyId}/details`} className="hover:text-primary">
                              {assessment.companyName}
                          </Link>
                        </TableCell>
                        <TableCell className="p-2">
                          <Badge variant={(assessment.type || 'GTM Readiness') === 'GTM Readiness' ? 'default' : 'secondary'}>
                            {assessment.type || 'GTM Readiness'}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2">
                          <Badge
                              variant={
                                  assessment.status === 'Completed' ? 'success' : (assessment.status === 'In Progress' ? 'secondary' : 'outline')
                              }
                          >
                            {assessment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2">
                            {new Date(assessment.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right p-2">
                          <div className="flex justify-end items-center">
                            {assessment.status === 'Completed' && (
                              <>
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
                              </>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleOpenAssessment(assessment)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  {assessment.status === 'Completed' ? 'View Report' : 'Resume'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(assessment)}
                                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
        </div>
        <div className="flex justify-end mt-4">
          <TablePagination
              count={sortedAssessments.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRowsPerPage) => {
                  setRowsPerPage(newRowsPerPage);
                  setPage(0);
              }}
          />
        </div>
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected assessments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={numSelected > 0 ? handleBulkDelete : handleDeleteAssessment}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
