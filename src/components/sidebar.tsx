
'use client';

import * as React from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronsLeft,
  ChevronsRight,
  Home,
  User,
  Briefcase,
  Users,
  ClipboardList,
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

const NavGroup = ({
    title,
    isCollapsed,
    isFirst,
    children
}: {
    title: string;
    isCollapsed: boolean;
    isFirst: boolean;
    children: React.ReactNode
}) => {
    return (
        <div className="space-y-1">
            {!isCollapsed && (
                <>
                    {!isFirst && <Separator className="my-2 bg-sidebar-border/50" />}
                    <h4 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2 pt-2 pb-1">{title}</h4>
                </>
            )}
            {children}
        </div>
    )
}

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const companyId = params.companyId as string;

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { 
        group: 'HOME', 
        links: [
            { href: `/${companyId}/dashboard`, label: 'Dashboard', icon: Home }
        ]
    },
    {
      group: 'MANAGE RECORDS',
      links: [
        { href: `/dashboard/companies`, label: 'Companies', icon: Briefcase },
        { href: `/dashboard/contacts`, label: 'Contacts', icon: Users },
      ],
    },
    {
      group: 'ASSESSMENTS',
      links: [
        { href: `/dashboard/assessments`, label: 'Assessments', icon: ClipboardList },
      ],
    },
    {
      group: 'SETTINGS',
      links: [
        { href: `/${companyId}/profile`, label: 'Profile', icon: User },
      ],
    },
  ];

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
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
                {navItems.map((group, index) => (
                  <NavGroup key={group.group} title={group.group} isCollapsed={isCollapsed} isFirst={index === 0}>
                    {group.links.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Tooltip key={item.href}>
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
                      );
                    })}
                  </NavGroup>
                ))}
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
