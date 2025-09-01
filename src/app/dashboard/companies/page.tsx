
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
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
  getCompanies,
  deleteCompany,
  deleteCompanies,
  Company,
} from '@/services/company-service';
import { getContacts, Contact } from '@/services/contact-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Plus, Trash2, ArrowUpDown, Link2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TablePagination } from '@/components/table-pagination';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useQuickAction } from '@/contexts/quick-action-context';
import { useToast } from '@/hooks/use-toast';

type SortKey = keyof Company | 'contactName';

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] =
    React.useState(false);
  const [companyToDelete, setCompanyToDelete] = React.useState<Company | null>(
    null
  );
  const [selectedCompanies, setSelectedCompanies] = React.useState<string[]>(
    []
  );

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const { openNewCompanyDialog, setOnCompanyCreated, globalSearchTerm } = useQuickAction();
  const { toast } = useToast();

  const fetchCompanies = React.useCallback(async () => {
    try {
      setLoading(true);
      const [companiesFromDb, contactsFromDb] = await Promise.all([getCompanies(), getContacts()]);
      
      const companiesWithContacts = companiesFromDb.map(company => {
        const companyContacts = contactsFromDb.filter(c => c.companyId === company.id);
        return {
          ...company,
          contact: companyContacts.length > 0 ? { name: companyContacts[0].name, avatar: companyContacts[0].avatar } : { name: '', avatar: '' }
        };
      });

      setCompanies(companiesWithContacts);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      // Here you might want to show a toast to the user
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCompanies();
    const unsubscribe = setOnCompanyCreated(() => fetchCompanies);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchCompanies, setOnCompanyCreated]);

  const handleViewDetails = (company: Company) => {
    router.push(`/dashboard/companies/${company.id}/details`);
  };

  const openDeleteDialog = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    try {
      await deleteCompany(companyToDelete.id);
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      await fetchCompanies(); // Refetch companies
    } catch (error) {
      console.error('Failed to delete company:', error);
    }
  };

  const handleSelectCompany = (companyId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCompanies((prev) => [...prev, companyId]);
    } else {
      setSelectedCompanies((prev) => prev.filter((id) => id !== companyId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    const currentVisibleIds = sortedCompanies
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((c) => c.id);
    if (isSelected) {
      setSelectedCompanies((prev) => [...new Set([...prev, ...currentVisibleIds])]);
    } else {
      setSelectedCompanies((prev) => prev.filter((id) => !currentVisibleIds.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteCompanies(selectedCompanies);
      setSelectedCompanies([]);
      setIsBulkDeleteDialogOpen(false);
      await fetchCompanies();
    } catch (error) {
      console.error('Failed to delete companies:', error);
    }
  };
  
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedCompanies = React.useMemo(() => {
    let sortableItems = [...companies];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'contactName') {
            aValue = a.contact?.name;
            bValue = b.contact?.name;
        } else {
            aValue = a[sortConfig.key as keyof Company];
            bValue = b[sortConfig.key as keyof Company];
        }

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
    return sortableItems.filter(company => 
        company.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        (company.contact?.name || '').toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        company.website.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );
  }, [companies, sortConfig, globalSearchTerm]);

  const handleCopyLink = (companyId: string) => {
    const url = `${window.location.origin}/public/assessment/${companyId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Assessment link has been copied to your clipboard.",
    });
  };


  const currentVisibleCompanies = sortedCompanies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const numSelected = selectedCompanies.length;
  const numSelectedOnPage = currentVisibleCompanies.filter(c => selectedCompanies.includes(c.id)).length;
  const allOnPageSelected = numSelectedOnPage > 0 && numSelectedOnPage === currentVisibleCompanies.length;
  const isPageIndeterminate = numSelectedOnPage > 0 && numSelectedOnPage < currentVisibleCompanies.length;

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Companies</h1>
        <p className="text-muted-foreground">
          Manage and track all companies in your portfolio
        </p>
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Total Records: {sortedCompanies.length}</div>
        <div className="flex items-center gap-2">
          {numSelected > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({numSelected})
            </Button>
          )}
          <Button size="icon" onClick={openNewCompanyDialog}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Company</span>
          </Button>
        </div>
      </div>
      <div className="border rounded-lg">
          {loading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
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
                  <TableHead className="border-t border-r border-b">
                    <Button variant="ghost" onClick={() => requestSort('name')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                      <div className="flex justify-between items-center w-full">
                        Company Name
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'name' ? 'opacity-100' : 'opacity-25')} />
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="border-t border-r border-b">
                     <Button variant="ghost" onClick={() => requestSort('contactName')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                       <div className="flex justify-between items-center w-full">
                        Primary Contact
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'contactName' ? 'opacity-100' : 'opacity-25')} />
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
                     <Button variant="ghost" onClick={() => requestSort('website')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                       <div className="flex justify-between items-center w-full">
                        Website
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'website' ? 'opacity-100' : 'opacity-25')} />
                       </div>
                    </Button>
                  </TableHead>
                  <TableHead className="border-t border-r border-b">
                     <Button variant="ghost" onClick={() => requestSort('lastActivity')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                       <div className="flex justify-between items-center w-full">
                        Last Activity
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'lastActivity' ? 'opacity-100' : 'opacity-25')} />
                       </div>
                    </Button>
                  </TableHead>
                  <TableHead className="text-right border-t border-b"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentVisibleCompanies.length > 0 ? (
                  currentVisibleCompanies.map((company) => (
                    <TableRow key={company.id} data-state={selectedCompanies.includes(company.id) && "selected"}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCompanies.includes(company.id)}
                          onCheckedChange={(checked) =>
                            handleSelectCompany(company.id, checked as boolean)
                          }
                          aria-label={`Select ${company.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/companies/${company.id}/details`} className="hover:text-primary">
                          {company.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {company.contact && company.contact.name && company.contact.name !== 'New Contact' ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(company.contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{company.contact.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            company.status === 'Active' ? 'default' : 'secondary'
                          }
                          className={
                            company.status === 'Active' ? 'bg-green-500' : ''
                          }
                        >
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                          <a href={`http://${company.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                              {company.website}
                          </a>
                      </TableCell>
                      <TableCell>
                          {new Date(company.lastActivity).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZoneName: 'short' })}
                      </TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(company)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleCopyLink(company.id)}
                            >
                                <Link2 className="mr-2 h-4 w-4" />
                                Copy Assessment Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(company)}
                              className="text-destructive"
                            >
                              Delete Company
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No companies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
      </div>
      <div className="flex justify-end mt-4">
        <TablePagination
            count={sortedCompanies.length}
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
              This action cannot be undone. This will permanently delete the
              company "{companyToDelete?.name}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              {selectedCompanies.length} selected companies.
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
    </div>
  );
}
