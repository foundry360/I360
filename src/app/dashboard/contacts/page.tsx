
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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  getContacts,
  deleteContact,
  deleteContacts,
  Contact,
} from '@/services/contact-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TablePagination } from '@/components/table-pagination';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useQuickAction } from '@/contexts/quick-action-context';

type SortKey = keyof Contact;

export default function ContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] =
    React.useState(false);
  const [contactToDelete, setContactToDelete] = React.useState<Contact | null>(
    null
  );
  const [selectedContacts, setSelectedContacts] = React.useState<string[]>(
    []
  );

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const { openNewContactDialog, setOnContactCreated, globalSearchTerm } = useQuickAction();

  const fetchContacts = React.useCallback(async () => {
    try {
      setLoading(true);
      const contactsFromDb = await getContacts();
      setContacts(contactsFromDb);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchContacts();
    setOnContactCreated(() => fetchContacts);
    return () => setOnContactCreated(null);
  }, [fetchContacts, setOnContactCreated]);

  const openDeleteDialog = (contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    try {
      await deleteContact(contactToDelete.id);
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
      await fetchContacts(); // Refetch contacts
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const handleSelectContact = (contactId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedContacts((prev) => [...prev, contactId]);
    } else {
      setSelectedContacts((prev) => prev.filter((id) => id !== contactId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    const currentVisibleIds = sortedContacts
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((c) => c.id);
    if (isSelected) {
      setSelectedContacts((prev) => [...new Set([...prev, ...currentVisibleIds])]);
    } else {
      setSelectedContacts((prev) => prev.filter((id) => !currentVisibleIds.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteContacts(selectedContacts);
      setSelectedContacts([]);
      setIsBulkDeleteDialogOpen(false);
      await fetchContacts();
    } catch (error) {
      console.error('Failed to delete contacts:', error);
    }
  };
  
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedContacts = React.useMemo(() => {
    let sortableItems = [...contacts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(contact => 
        contact.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        (contact.companyName || '').toLowerCase().includes(globalSearchTerm.toLowerCase())
    );
  }, [contacts, sortConfig, globalSearchTerm]);


  const currentVisibleContacts = sortedContacts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const numSelected = selectedContacts.length;
  const numSelectedOnPage = currentVisibleContacts.filter(c => selectedContacts.includes(c.id)).length;
  const allOnPageSelected = numSelectedOnPage > 0 && numSelectedOnPage === currentVisibleContacts.length;
  const isPageIndeterminate = numSelectedOnPage > 0 && numSelectedOnPage < currentVisibleContacts.length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="text-muted-foreground">
          Manage all contacts in your system
        </p>
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Total Records: {sortedContacts.length}</div>
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
          <Button size="icon" onClick={openNewContactDialog}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Contact</span>
          </Button>
        </div>
      </div>
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
                    <Button variant="ghost" onClick={() => requestSort('name')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                      <div className="flex justify-between items-center w-full">
                        Name
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'name' ? 'opacity-100' : 'opacity-25')} />
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('companyName')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                       <div className="flex justify-between items-center w-full">
                        Company
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'companyName' ? 'opacity-100' : 'opacity-25')} />
                       </div>
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('email')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                       <div className="flex justify-between items-center w-full">
                        Email
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'email' ? 'opacity-100' : 'opacity-25')} />
                       </div>
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('phone')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                       <div className="flex justify-between items-center w-full">
                        Phone
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'phone' ? 'opacity-100' : 'opacity-25')} />
                       </div>
                    </Button>
                  </TableHead>
                   <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('title')} className="group w-full p-0 hover:bg-transparent hover:text-muted-foreground">
                       <div className="flex justify-between items-center w-full">
                        Title
                        <ArrowUpDown className={cn("h-4 w-4", sortConfig?.key === 'title' ? 'opacity-100' : 'opacity-25')} />
                       </div>
                    </Button>
                  </TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentVisibleContacts.map((contact) => (
                  <TableRow key={contact.id} data-state={selectedContacts.includes(contact.id) && "selected"}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) =>
                          handleSelectContact(contact.id, checked as boolean)
                        }
                        aria-label={`Select ${contact.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contact.avatar} alt={contact.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{contact.name}</span>
                      </div>
                    </TableCell>
                     <TableCell>
                      {contact.companyId && contact.companyName ? (
                        <Link href={`/${contact.companyId}/details`} className="hover:text-primary">
                          {contact.companyName}
                        </Link>
                        ) : (
                          'N/A'
                        )
                      }
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.title}</TableCell>
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
                            onClick={() => { /* Placeholder for future view details */ }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(contact)}
                             className="text-red-600"
                          >
                            Delete Contact
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
      </Card>
      <div className="flex justify-end mt-4">
        <TablePagination
            count={sortedContacts.length}
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
              contact "{contactToDelete?.name}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact}>
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
              {selectedContacts.length} selected contacts.
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
