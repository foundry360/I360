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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCompanies, createCompany, Company } from '@/services/company-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';

const initialNewCompanyState = {
  name: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  website: '',
};

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newCompany, setNewCompany] = React.useState(initialNewCompanyState);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const fetchCompanies = React.useCallback(async () => {
    try {
      setLoading(true);
      const companiesFromDb = await getCompanies();
      setCompanies(companiesFromDb);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
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
        alert("Company name is required.");
        return;
    }
    try {
      await createCompany(newCompany);
      setNewCompany(initialNewCompanyState);
      setIsDialogOpen(false);
      await fetchCompanies(); // Refetch companies to show the new one
    } catch (error) {
      console.error("Failed to create company:", error);
      // Here you might want to show a toast to the user
    }
  };

  const handleViewDetails = (company: Company) => {
    router.push(`/${company.id}/details`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Company</Button>
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
                  <Input id="name" value={newCompany.name} onChange={handleInputChange} className="col-span-3" required />
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Company</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
          <CardDescription>
            A list of all companies in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      size="icon"
                      onClick={() => handleViewDetails(company)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
