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
  CardHeader,
  CardTitle,
  CardDescription,
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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialCompanies = [
  {
    id: 'acme-inc',
    name: 'Acme Inc.',
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    phone: '555-1234',
    website: 'acme.com',
    contact: {
      name: 'Jane Doe',
      avatar: 'https://picsum.photos/100/100?q=1',
    },
    status: 'Active',
  },
  {
    id: 'widgets-co',
    name: 'Widgets Co.',
    street: '456 Oak Ave',
    city: 'Someville',
    state: 'TX',
    zip: '67890',
    phone: '555-5678',
    website: 'widgets.co',
    contact: {
      name: 'John Smith',
      avatar: 'https://picsum.photos/100/100?q=2',
    },
    status: 'Active',
  },
  {
    id: 'innovate-llc',
    name: 'Innovate LLC',
    street: '789 Pine Rd',
    city: 'Metropolis',
    state: 'NY',
    zip: '10101',
    phone: '555-8765',
    website: 'innovatellc.com',
    contact: {
      name: 'Emily Johnson',
      avatar: 'https://picsum.photos/100/100?q=3',
    },
    status: 'Inactive',
  },
  {
    id: 'synergy-corp',
    name: 'Synergy Corp',
    street: '321 Elm St',
    city: 'Star City',
    state: 'FL',
    zip: '33333',
    phone: '555-4321',
    website: 'synergy.corp',
    contact: {
      name: 'Michael Brown',
      avatar: 'https://picsum.photos/100/100?q=4',
    },
    status: 'Active',
  },
];

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = React.useState(initialCompanies);
  const [newCompany, setNewCompany] = React.useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    website: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewCompany((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateCompany = () => {
    const newCompanyData = {
      id: newCompany.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCompany.name,
      street: newCompany.street,
      city: newCompany.city,
      state: newCompany.state,
      zip: newCompany.zip,
      phone: newCompany.phone,
      website: newCompany.website,
      contact: {
        name: 'New Contact', // Placeholder
        avatar: `https://picsum.photos/100/100?q=${companies.length + 1}`,
      },
      status: 'Active',
    };
    setCompanies([...companies, newCompanyData]);
    // Reset form
    setNewCompany({ name: '', street: '', city: '', state: '', zip: '', phone: '', website: '' });
  };

  const handleViewDetails = (company: typeof initialCompanies[0]) => {
    const query = new URLSearchParams(company).toString();
    router.push(`/${company.id}/details?${query}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Company</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new company.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Company Name
                </Label>
                <Input id="name" value={newCompany.name} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="street" className="text-right">
                  Street Address
                </Label>
                <Input id="street" value={newCompany.street} onChange={handleInputChange} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="city" className="text-right">
                   City
                 </Label>
                 <Input id="city" value={newCompany.city} onChange={handleInputChange} className="col-span-3" />
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="state" className="text-right">
                   State
                 </Label>
                 <Input id="state" value={newCompany.state} onChange={handleInputChange} className="col-span-3" />
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="zip" className="text-right">
                   Postal Code
                 </Label>
                 <Input id="zip" value={newCompany.zip} onChange={handleInputChange} className="col-span-3" />
               </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone Number
                </Label>
                <Input id="phone" value={newCompany.phone} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="website" className="text-right">
                  Website
                </Label>
                <Input id="website" value={newCompany.website} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" onClick={handleCreateCompany}>Create Company</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
          <CardDescription>
            A list of all companies in your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={company.contact.avatar} data-ai-hint="person" />
                        <AvatarFallback>
                          {company.contact.name.charAt(0)}
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
                      className={company.status === 'Active' ? 'bg-green-500' : ''}
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(company)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
