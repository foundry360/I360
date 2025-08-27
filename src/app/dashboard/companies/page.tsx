'use client';

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

const companies = [
  {
    id: 'acme-inc',
    name: 'Acme Inc.',
    contact: {
      name: 'Jane Doe',
      avatar: 'https://picsum.photos/100/100?q=1',
    },
    status: 'Active',
  },
  {
    id: 'widgets-co',
    name: 'Widgets Co.',
    contact: {
      name: 'John Smith',
      avatar: 'https://picsum.photos/100/100?q=2',
    },
    status: 'Active',
  },
  {
    id: 'innovate-llc',
    name: 'Innovate LLC',
    contact: {
      name: 'Emily Johnson',
      avatar: 'https://picsum.photos/100/100?q=3',
    },
    status: 'Inactive',
  },
  {
    id: 'synergy-corp',
    name: 'Synergy Corp',
    contact: {
      name: 'Michael Brown',
      avatar: 'https://picsum.photos/100/100?q=4',
    },
    status: 'Active',
  },
];

export default function CompaniesPage() {
  const router = useRouter();

  const handleViewDetails = (companyId: string) => {
    router.push(`/${companyId}/details`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Companies</h1>
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
                      onClick={() => handleViewDetails(company.id)}
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
