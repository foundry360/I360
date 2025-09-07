
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronsLeft,
  ChevronsRight,
  Home,
  User,
  Briefcase,
  Users,
  ClipboardList,
  FolderKanban,
  Library,
  BookCopy,
  Star,
  Search,
  History,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { getProjects, Project } from '@/services/project-service';
import { getAssessments, Assessment } from '@/services/assessment-service';
import { Skeleton } from './ui/skeleton';

const NavGroup = ({
    title,
    isCollapsed,
    children
}: {
    title: string;
    isCollapsed: boolean;
    children: React.ReactNode
}) => {
    return (
        <div className="space-y-1">
            {!isCollapsed && (
                <>
                    <Separator className="my-4 bg-sidebar-divider" />
                    <h4 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider px-2 pt-2 pb-1">{title}</h4>
                </>
            )}
            {children}
        </div>
    )
}

type CombinedItem = (Project | Assessment) & { itemType: 'Engagement' | 'Assessment' };

function StarredItemsPopoverContent({ isOpen }: { isOpen: boolean }) {
    const [items, setItems] = React.useState<CombinedItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const router = useRouter();

    React.useEffect(() => {
        const fetchStarredItems = async () => {
            setLoading(true);
            const [projects, assessments] = await Promise.all([getProjects(), getAssessments()]);
            
            const starredProjects = projects
                .filter(p => p.isStarred)
                .map(p => ({ ...p, itemType: 'Engagement' as const }));
                
            const starredAssessments = assessments
                .filter(a => a.isStarred)
                .map(a => ({ ...a, itemType: 'Assessment' as const }));

            setItems([...starredProjects, ...starredAssessments].sort((a,b) => a.name.localeCompare(b.name)));
            setLoading(false);
        };
        if (isOpen) {
          fetchStarredItems();
        }
    }, [isOpen]);

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleItemClick = (item: CombinedItem) => {
        if (item.itemType === 'Engagement') {
            router.push(`/dashboard/projects/${item.id}`);
        } else {
            router.push(`/assessment/${item.id}/report`);
        }
    };

    return (
        <PopoverContent className="w-80 sidebar-popover" side="right" align="start">
            <h4 className="font-medium text-sm mb-2">Starred Items</h4>
            <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search starred items..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ScrollArea className="h-72">
                <div className="space-y-2 pr-4">
                    {loading ? (
                        Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div 
                                key={`${item.itemType}-${item.id}`} 
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                                onClick={() => handleItemClick(item)}
                            >
                                {item.itemType === 'Engagement' ? 
                                    <FolderKanban className="h-5 w-5 text-primary" /> : 
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                }
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.itemType}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-10">No starred items found.</p>
                    )}
                </div>
            </ScrollArea>
        </PopoverContent>
    )
}

function RecentItemsPopoverContent() {
    const [items, setItems] = React.useState<CombinedItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const router = useRouter();

    React.useEffect(() => {
        const fetchRecentItems = async () => {
            setLoading(true);
            const [projects, assessments] = await Promise.all([getProjects(), getAssessments()]);
            
            const engagementItems = projects.map(p => ({ ...p, itemType: 'Engagement' as const }));
            const assessmentItems = assessments.map(a => ({ ...a, itemType: 'Assessment' as const }));

            const allItems = [...engagementItems, ...assessmentItems];
            
            const sortedItems = allItems.sort((a,b) => {
                const dateA = new Date(a.lastActivity || a.startDate).getTime();
                const dateB = new Date(b.lastActivity || b.startDate).getTime();
                return dateB - dateA;
            });

            setItems(sortedItems.slice(0, 20)); // Get top 20 recent items
            setLoading(false);
        };
        fetchRecentItems();
    }, []);

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleItemClick = (item: CombinedItem) => {
        if (item.itemType === 'Engagement') {
            router.push(`/dashboard/projects/${item.id}`);
        } else {
            router.push(`/assessment/${item.id}/report`);
        }
    };

    return (
        <PopoverContent className="w-80 sidebar-popover" side="right" align="start">
            <h4 className="font-medium text-sm mb-2">Recent Items</h4>
            <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search recent items..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ScrollArea className="h-72">
                <div className="space-y-2 pr-4">
                    {loading ? (
                        Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div 
                                key={`${item.itemType}-${item.id}`} 
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                                onClick={() => handleItemClick(item)}
                            >
                                {item.itemType === 'Engagement' ? 
                                    <FolderKanban className="h-5 w-5 text-primary" /> : 
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                }
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.itemType}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-10">No recent items found.</p>
                    )}
                </div>
            </ScrollArea>
        </PopoverContent>
    )
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isStarredPopoverOpen, setIsStarredPopoverOpen] = React.useState(false);

  const navItems = [
    {
        group: 'HOME',
        links: [
            { href: `/dashboard`, label: 'Dashboard', icon: Home },
            { id: 'starred', label: 'Starred', icon: Star },
            { id: 'recent', label: 'Recent', icon: History }
        ]
    },
    {
      group: 'MANAGE RECORDS',
      links: [
        { href: `/dashboard/companies`, label: 'Companies', icon: Briefcase },
        { href: `/dashboard/contacts`, label: 'Contacts', icon: Users },
        { href: `/dashboard/projects`, label: 'Engagements', icon: FolderKanban },
      ],
    },
    {
      group: 'TOOLS',
      links: [
        { href: `/dashboard/assessments`, label: 'Assessments', icon: ClipboardList },
        { href: `/dashboard/library`, label: 'Library', icon: Library },
        { href: `/dashboard/collections`, label: 'Collections', icon: BookCopy },
      ],
    },
    {
      group: 'SETTINGS',
      links: [
        { href: `/dashboard/profile`, label: 'Profile', icon: User },
      ],
    },
  ];

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = 'href' in item && pathname === item.href;

    if (item.id === 'starred') {
        return (
             <Popover key={item.id} open={isStarredPopoverOpen} onOpenChange={setIsStarredPopoverOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                             <Button
                                variant="sidebar"
                                className='w-full justify-start relative'
                                >
                                <div className="flex items-center flex-1">
                                    <Icon
                                    className={cn('h-5 w-5', {
                                        'mr-2': !isCollapsed,
                                    })}
                                    />
                                    {!isCollapsed && item.label}
                                </div>
                                {!isCollapsed && <ChevronRightIcon className="h-4 w-4" />}
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right">
                        {item.label}
                        </TooltipContent>
                    )}
                </Tooltip>
                <StarredItemsPopoverContent isOpen={isStarredPopoverOpen} />
            </Popover>
        )
    }

    if (item.id === 'recent') {
        const PopoverContentComponent = RecentItemsPopoverContent;
        return (
             <Popover key={item.id}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                             <Button
                                variant="sidebar"
                                className='w-full justify-start relative'
                                >
                                <div className="flex items-center flex-1">
                                    <Icon
                                    className={cn('h-5 w-5', {
                                        'mr-2': !isCollapsed,
                                    })}
                                    />
                                    {!isCollapsed && item.label}
                                </div>
                                {!isCollapsed && <ChevronRightIcon className="h-4 w-4" />}
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right">
                        {item.label}
                        </TooltipContent>
                    )}
                </Tooltip>
                <PopoverContentComponent />
            </Popover>
        )
    }

    return (
        <Tooltip key={item.href || item.id}>
            <TooltipTrigger asChild>
                <Button
                asChild
                variant="sidebar"
                className={cn(
                    'w-full justify-start relative',
                    isActive &&
                    'bg-sidebar-accent text-sidebar-accent-foreground'
                )}
                >
                    <Link href={item.href}>
                        {isActive && (
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
                        )}
                        <Icon
                        className={cn('h-5 w-5', {
                            'mr-2': !isCollapsed,
                        })}
                        />
                        {!isCollapsed && item.label}
                    </Link>
                </Button>
            </TooltipTrigger>
            {isCollapsed && (
                <TooltipContent side="right">
                {item.label}
                </TooltipContent>
            )}
        </Tooltip>
    )
  }

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            'relative h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border',
            {
              'w-64': !isCollapsed,
              'w-16': isCollapsed,
            }
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-2 p-2 pt-4">
              <nav className="space-y-1">
                {navItems.map((group) => {
                  if (group.group === 'HOME') {
                    return (
                        <div key={group.group}>
                            {group.links.map((item) => <div key={item.label}>{renderNavItem(item)}</div>)}
                        </div>
                    )
                  }
                  return (
                    <NavGroup key={group.group} title={group.group} isCollapsed={isCollapsed}>
                      {group.links.map((item) => {
                        const Icon = item.icon;
                        const isActive = 'href' in item && pathname.startsWith(item.href);
                        return (
                          <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                              <Button
                                asChild
                                variant="sidebar"
                                className={cn(
                                  'w-full justify-start relative',
                                  isActive &&
                                    'bg-sidebar-accent text-sidebar-accent-foreground'
                                )}
                              >
                                
                                    <Link href={'href' in item ? item.href : '#'}>
                                    {isActive && (
                                        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
                                    )}
                                    <Icon
                                        className={cn('h-5 w-5', {
                                        'mr-2': !isCollapsed,
                                        })}
                                    />
                                    {!isCollapsed && item.label}
                                    </Link>
                                
                              </Button>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right">
                                {item.label}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </NavGroup>
                  )
                })}
              </nav>
            </div>

            <div className="border-t border-sidebar-border p-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={toggleSidebar}
                    aria-label={
                      isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                    }
                  >
                    {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {isCollapsed ? 'Expand' : 'Collapse'}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
