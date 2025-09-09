
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
import { createCompany } from '@/services/company-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

const initialNewCompanyState = {
  name: '',
  description: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  website: '',
};

export function NewCompanyDialog() {
  const { isNewCompanyDialogOpen, closeNewCompanyDialog, onCompanyCreated } =
    useQuickAction();
  const [newCompany, setNewCompany] = React.useState(initialNewCompanyState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      closeNewCompanyDialog();
      if (onCompanyCreated) {
        onCompanyCreated();
      }
    } catch (error) {
      console.error('Failed to create company:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewCompany(initialNewCompanyState);
      closeNewCompanyDialog();
    }
  };

  return (
    <Dialog open={isNewCompanyDialogOpen} onOpenChange={handleOpenChange}>
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newCompany.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="A brief description of the company"
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
              onClick={() => handleOpenChange(false)}
              className={cn('dark:btn-outline-cancel')}
            >
              Cancel
            </Button>
            <Button type="submit">Create Company</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
