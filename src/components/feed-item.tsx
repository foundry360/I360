
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Info,
  MoreHorizontal,
  Reply,
  Undo2,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/services/notification-service';
import { updateNotification } from '@/services/notification-service';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, add } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUser } from '@/contexts/user-context';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface FeedItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: () => void;
}

const notificationTypeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; border: string }
> = {
  system: { icon: Info, color: 'text-sky-500', border: 'border-sky-500/50' },
  alert: { icon: CircleAlert, color: 'text-destructive', border: 'border-destructive/50' },
  activity: { icon: Bell, color: 'text-foreground', border: 'border-transparent' },
};

export const FeedItem: React.FC<FeedItemProps> = ({
  notification,
  isSelected,
  onSelect,
  onUpdate,
}) => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const config = notificationTypeConfig[notification.type] || notificationTypeConfig.activity;
  const Icon = config.icon;

  const handleToggleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNotification(notification.id, { isRead: !notification.isRead });
    onUpdate();
  };

  const handleSnooze = async (duration: Duration) => {
    const snoozedUntil = add(new Date(), duration).toISOString();
    await updateNotification(notification.id, { snoozedUntil });
    toast({
        title: "Notification Snoozed",
        description: "It will reappear in your feed later."
    });
    onUpdate();
  };
  
  const handleArchive = async () => {
    await updateNotification(notification.id, { isArchived: true });
    toast({
        title: "Notification Archived",
    });
    onUpdate();
  }
  
  const handleItemClick = () => {
      if(notification.link) {
          router.push(notification.link);
      }
      if (!notification.isRead) {
          updateNotification(notification.id, { isRead: true });
      }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer group',
        !notification.isRead && 'bg-primary/5 dark:bg-primary/10',
        isSelected && 'bg-primary/10 ring-2 ring-primary',
        config.border
      )}
      onClick={handleItemClick}
    >
      <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(notification.id)}
          aria-label={`Select notification: ${notification.message}`}
        />
        <Icon className={cn('h-5 w-5 mt-1 shrink-0', config.color)} />
      </div>

      <div className="flex-1">
        <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      
      <div 
        className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}
      >
        <Button variant="ghost" size="sm" onClick={handleToggleRead}>
          {notification.isRead ? <Undo2 className="h-4 w-4 mr-2"/> : <Check className="h-4 w-4 mr-2"/>}
          {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <Reply className="mr-2 h-4 w-4" /> Reply
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                       <Clock className="mr-2 h-4 w-4" /> Snooze
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                             <DropdownMenuItem onClick={() => handleSnooze({ hours: 3 })}>For 3 hours</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleSnooze({ days: 1 })}>Until tomorrow</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleSnooze({ weeks: 1 })}>For a week</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
