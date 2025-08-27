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
import { useRouter, useParams } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;

  const handleLogout = () => {
    // In a real app, you would clear the session here.
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-6 text-sidebar-foreground">
      <Logo />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="user avatar" />
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
           <DropdownMenuItem asChild>
            <Link href="/dashboard/workspaces">Switch Workspace</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
