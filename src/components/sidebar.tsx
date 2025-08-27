'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Home,
  User,
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

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="primary"
                    className="w-full justify-start"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className={cn({ 'mr-2': !isCollapsed })} />
                    {!isCollapsed && 'New Assessment'}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">New Assessment</TooltipContent>
                )}
              </Tooltip>

              <nav className="space-y-1 pt-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant="ghost"
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
                            <Icon className={cn('h-5 w-5', { 'mr-2': !isCollapsed })} />
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
