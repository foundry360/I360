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
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCompanies,
  createCompany,
  deleteCompany,
  deleteCompanies,
  Company,
} from '@/services/company-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Plus, Trash2, Filter, Search, ArrowUpDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TablePagination } from '@/components/table-pagination';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const initialNewCompanyState = {
  name: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  website: '',
};

type SortKey = keyof Company;

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newCompany, setNewCompany] = React.useState(initialNewCompanyState);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
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
  const [filterText, setFilterText] = React.useState('');
  const [isFilterVisible, setIsFilterVisible] = React.useState(false);

  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const fetchCompanies = React.useCallback(async () => {
    try {
      setLoading(true);
      const companiesFromDb = await getCompanies();
      setCompanies(companiesFromDb);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      // Here you might want to show a toast to the user
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewCompany((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name) {
      alert('Company name is required');
      return;
    }
    try {
      await createCompany(newCompany);
      setNewCompany(initialNewCompanyState);
      setIsDialogOpen(false);
      await fetchCompanies(); // Refetch companies to show the new one
    } catch (error) {
      console.error('Failed to create company:', error);
      // Here you might want to show a toast to the user
    }
  };

  const handleViewDetails = (company: Company) => {
    router.push(`/${company.id}/details`);
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
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Special handling for nested contact name
        if (sortConfig.key === 'contact') {
            aValue = a.contact.name;
            bValue = b.contact.name;
        }

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
        company.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [companies, sortConfig, filterText]);


  const currentVisibleCompanies = sortedCompanies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const numSelected = selectedCompanies.length;
  const numSelectedOnPage = currentVisibleCompanies.filter(c => selectedCompanies.includes(c.id)).length;
  const allOnPageSelected = numSelectedOnPage > 0 && numSelectedOnPage === currentVisibleCompanies.length;
  const isPageIndeterminate = numSelectedOnPage > 0 && numSelectedOnPage < currentVisibleCompanies.length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100" />;
    }
    if (sortConfig.direction === 'ascending') {
        return <ArrowUpDown className="h-4 w-4 ml-2" />; // Or a specific up icon
    }
    return <ArrowUpDown className="h-4 w-4 ml-2" />; // Or a specific down icon
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Companies</h1>
      <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
              A list of all companies in your portfolio
          </p>
          <div className="flex items-center gap-2">
            {numSelected > 0 && (
                <Button
                variant="outline"
                onClick={() => setIsBulkDeleteDialogOpen(true)}
                >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({numSelected})
                </Button>
            )}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
              {isFilterVisible && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by company name..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                <Button size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleCreateCompany}>
                    <DialogHeader>
                    <DialogTitle>Create New Company</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new company
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                        Company Name
                        </Label>
                        <Input
                        id="name"
                        value={newCompany.name}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="street" className="text-right">
                        Street Address
                        </Label>
                        <Input
                        id="street"
                        value={newCompany.street}
                        onChange={handleInputChange}
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">
                        City
                        </Label>
                        <Input
                        id="city"
                        value={newCompany.city}
                        onChange={handleInputChange}
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="state" className="text-right">
                        State
                        </Label>
                        <Input
                        id="state"
                        value={newCompany.state}
                        onChange={handleInputChange}
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="zip" className="text-right">
                        Postal Code
                        </Label>
                        <Input
                        id="zip"
                        value={newCompany.zip}
                        onChange={handleInputChange}
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                        Phone Number
                        </Label>
                        <Input
                        id="phone"
                        value={newCompany.phone}
                        onChange={handleInputChange}
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="website" className="text-right">
                        Website
                        </Label>
                        <Input
                        id="website"
                        value={newCompany.website}
                        onChange={handleInputChange}
                        className="col-span-3"
                        />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">Create Company</Button>
                    </DialogFooter>
                </form>
                </DialogContent>
            </Dialog>
            </div>
      </div>
      <Separator className="bg-gray-200"/>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allOnPageSelected}
                      onCheckedChange={(checked) =>
                        handleSelectAll(checked as boolean)
                      }
                      aria-label="Select all on page"
                      data-state={isPageIndeterminate ? 'indeterminate' : (allOnPageSelected ? 'checked' : 'unchecked')}
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('name')} className="group -ml-4">
                      Company Name
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('contact')} className="group -ml-4">
                      Primary Contact
                       {getSortIcon('contact')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('status')} className="group -ml-4">
                      Status
                      {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('lastActivity')} className="group -ml-4">
                      Last Activity
                      {getSortIcon('lastActivity')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentVisibleCompanies.map((company) => (
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
                      <Link href={`/${company.id}/details`} className="hover:text-primary">
                        {company.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(company.contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{company.contact.name}</span>
                      </div>
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
                        {new Date(company.lastActivity).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(company)}
                             className="text-red-600"
                          >
                            Delete Company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
         <CardFooter className="justify-end">
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
        </CardFooter>
      </Card>
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
