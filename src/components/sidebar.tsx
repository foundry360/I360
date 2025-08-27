'use client';

import * as React from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Home,
  User,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AssessmentModal } from './assessment-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const companyId = params.companyId as string;

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const navItems = [
    { type: 'link', href: `/${companyId}/dashboard`, label: 'Dashboard', icon: Home },
    {
      type: 'action',
      label: 'New Assessment',
      icon: Plus,
      action: () => setIsModalOpen(true),
    },
    { type: 'link', href: `/${companyId}/details`, label: 'Company Details', icon: Building2 },
    { type: 'link', href: `/${companyId}/profile`, label: 'Profile', icon: User },
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
                {navItems.map((item) => {
                  const Icon = item.icon;
                  if (item.type === 'link') {
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
                  }
                  if (item.type === 'action') {
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="sidebar"
                            className="w-full justify-start"
                            onClick={item.action}
                          >
                            <Icon
                              className={cn('h-5 w-5', {
                                'mr-2': !isCollapsed,
                              })}
                            />
                            {!isCollapsed && item.label}
                          </Button>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  }
                  return null;
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
      <AssessmentModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
