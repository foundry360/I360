'use client';

import * as React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div
      className={cn(
        'relative h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        {
          'w-64': !isCollapsed,
          'w-16': isCollapsed,
        }
      )}
    >
      <div className="flex h-full flex-col">
        <div
          className={cn('flex h-16 items-center', {
            'justify-center': isCollapsed,
            'justify-end px-4': !isCollapsed,
          })}
        ></div>
        <nav className="flex-1 space-y-2 px-4"></nav>
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-center p-2"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </Button>
        </div>
      </div>
    </div>
  );
}
