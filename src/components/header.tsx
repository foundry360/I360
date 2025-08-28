
'use client';

import { Logo } from './logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Plus, Search, LogOut } from 'lucide-react';
import { useQuickAction } from '@/contexts/quick-action-context';
import * as React from 'react';
import { Input } from './ui/input';
import { Company, searchCompanies } from '@/services/company-service';
import { signOut } from '@/services/auth-service';
import { useUser } from '@/contexts/user-context';


export function Header() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const companyId = params.companyId as string || 'acme-inc';
  const { openNewCompanyDialog, openNewContactDialog, openAssessmentModal, globalSearchTerm, setGlobalSearchTerm } = useQuickAction();
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Company[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const performSearch = async () => {
      if (globalSearchTerm) {
        const results = await searchCompanies(globalSearchTerm);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    performSearch();
  }, [globalSearchTerm]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchVisible(false);
        setGlobalSearchTerm('');
      }
    };

    if (isSearchVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchVisible, setGlobalSearchTerm]);

  const handleResultClick = (companyId: string) => {
    router.push(`/${companyId}/details`);
    setIsSearchVisible(false);
    setGlobalSearchTerm('');
  };
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getInitials = (email: string) => {
    return email[0].toUpperCase();
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-6 text-sidebar-foreground">
      <Logo />
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-2" ref={searchInputRef}>
            <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(!isSearchVisible)}>
                <Search className="h-5 w-5" />
            </Button>
            {isSearchVisible && (
                <div className="absolute top-12 right-0 z-10">
                     <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search..." 
                            className="pl-8 w-64 bg-sidebar-accent border-sidebar-border focus:bg-background focus:text-foreground"
                            value={globalSearchTerm}
                            onChange={(e) => setGlobalSearchTerm(e.target.value)}
                            autoFocus
                        />
                     </div>
                     {searchResults.length > 0 && (
                        <div className="absolute mt-1 w-64 rounded-md bg-background border border-border shadow-lg">
                            <ul className="py-1">
                                {searchResults.map((company) => (
                                    <li key={company.id}
                                        className="px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                                        onClick={() => handleResultClick(company.id)}
                                    >
                                       {company.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                     )}
                </div>
            )}
        </div>
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
             <DropdownMenuItem onSelect={openNewContactDialog}>
              New Contact
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openAssessmentModal()}>
              New Assessment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage
                src={user?.photoURL ?? `https://i.pravatar.cc/150?u=${user?.email}`}
                data-ai-hint="user avatar"
              />
              <AvatarFallback>{user?.email ? getInitials(user.email) : 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/${companyId}/dashboard`}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${companyId}/profile`}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/dashboard/workspaces">Switch Workspace</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
