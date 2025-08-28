
'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createContact } from '@/services/contact-service';
import { getCompanies, type Company } from '@/services/company-service';
import { useQuickAction } from '@/contexts/quick-action-context';

const initialNewContactState = {
  name: '',
  email: '',
  phone: '',
  title: '',
  companyId: '',
};

export function NewContactDialog() {
  const { isNewContactDialogOpen, closeNewContactDialog, onContactCreated } = useQuickAction();
  const [newContact, setNewContact] = React.useState(initialNewContactState);
  const [companies, setCompanies] = React.useState<Company[]>([]);

  React.useEffect(() => {
    if (isNewContactDialogOpen) {
      getCompanies().then(setCompanies);
    }
  }, [isNewContactDialogOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewContact((prev) => ({ ...prev, [id]: value }));
  };

  const handleCompanyChange = (companyId: string) => {
    setNewContact((prev) => ({ ...prev, companyId }));
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.companyId) {
      alert('Contact name and company are required');
      return;
    }
    try {
      await createContact(newContact);
      setNewContact(initialNewContactState);
      closeNewContactDialog();
      if (onContactCreated) {
        onContactCreated();
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewContact(initialNewContactState);
      closeNewContactDialog();
    }
  };

  return (
    <Dialog open={isNewContactDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleCreateContact}>
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new contact.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input id="name" value={newContact.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" value={newContact.email} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" value={newContact.phone} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" value={newContact.title} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyId" className="text-right">
                Company
              </Label>
              <Select onValueChange={handleCompanyChange} value={newContact.companyId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Contact</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
