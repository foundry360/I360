
'use client';

import { Logo } from './logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Plus, Search, LogOut, Briefcase, UserPlus, FilePlus, Bell, CheckCheck, Maximize, Minimize, FolderKanban, Moon, Sun, Monitor } from 'lucide-react';
import { useQuickAction } from '@/contexts/quick-action-context';
import * as React from 'react';
import { Input } from './ui/input';
import { Company, searchCompanies } from '@/services/company-service';
import { signOut } from '@/services/auth-service';
import { useUser } from '@/contexts/user-context';
import { getNotifications, markAllNotificationsAsRead, type Notification } from '@/services/notification-service';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';


export function Header() {
  const router = useRouter();
  const { user } = useUser();
  const { setTheme } = useTheme();
  const { openNewCompanyDialog, openNewContactDialog, openAssessmentModal, openNewProjectDialog, globalSearchTerm, setGlobalSearchTerm } = useQuickAction();
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Company[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (user) {
      const notes = await getNotifications();
      setNotifications(notes);
    }
  }, [user]);

  React.useEffect(() => {
    fetchNotifications();
    // Optional: Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

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
    router.push(`/dashboard/companies/${companyId}/details`);
    setIsSearchVisible(false);
    setGlobalSearchTerm('');
  };
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    fetchNotifications();
  }
  
  const handleNotificationClick = (notification: Notification) => {
    setIsNotificationsOpen(false);
    router.push(notification.link);
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const getInitials = (email: string) => {
    if (!email) return 'U';
    return email[0].toUpperCase();
  }
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="flex h-16 items-center justify-between gap-4 bg-sidebar px-6 text-sidebar-foreground">
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
        <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          <span className="sr-only">Toggle Fullscreen</span>
        </Button>
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
             <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">{unreadCount}</Badge>
                )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Notifications</h4>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                )}
            </div>
            <div className="space-y-2">
                {notifications.length > 0 ? notifications.slice(0, 5).map(note => (
                  <div key={note.id} onClick={() => handleNotificationClick(note)} className="p-2 rounded-md hover:bg-muted cursor-pointer">
                      <p className={cn("text-sm mb-1", !note.isRead && "font-bold")}>{note.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No new notifications.</p>
                )}
            </div>
            <DropdownMenuSeparator className="my-2" />
            <Button variant="outline" className="w-full" size="sm" asChild>
                <Link href="/dashboard/notifications">View all notifications</Link>
            </Button>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={openNewCompanyDialog}>
              <Briefcase className="mr-2 h-4 w-4" />
              New Company
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={openNewContactDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              New Contact
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openAssessmentModal()}>
              <FilePlus className="mr-2 h-4 w-4" />
              New Assessment
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={openNewProjectDialog}>
              <FolderKanban className="mr-2 h-4 w-4" />
              New Project
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
              <Link href={`/dashboard`}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/profile`}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                  Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Monitor className="mr-2 h-4 w-4" /> System
                  </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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
