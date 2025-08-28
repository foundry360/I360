
'use client';

import { Logo } from './logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useQuickAction } from '@/contexts/quick-action-context';

export function Header() {
  const params = useParams();
  const companyId = params.companyId as string;
  const { openNewCompanyDialog } = useQuickAction();

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-6 text-sidebar-foreground">
      <Logo />
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={openNewCompanyDialog}>
              New Company
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage
                src="https://picsum.photos/100/100"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${companyId}/dashboard`}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${companyId}/profile`}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
