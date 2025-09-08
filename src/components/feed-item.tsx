
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Info,
  MoreHorizontal,
  Reply,
  Undo2,
  AtSign,
  MessageSquare,
  AlertTriangle,
  MonitorCog,
  Star,
  ArchiveX,
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
  showActions?: boolean;
}

const notificationTypeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; border: string }
> = {
  system: { icon: MonitorCog, color: 'text-purple-500', border: 'border-l-purple-500' },
  alert: { icon: AlertTriangle, color: 'text-destructive', border: 'border-l-destructive' },
  activity: { icon: Bell, color: 'text-orange-500', border: 'border-l-orange-500' },
  mention: { icon: AtSign, color: 'text-blue-500', border: 'border-l-blue-500' },
  thread: { icon: MessageSquare, color: 'text-green-500', border: 'border-l-green-500' },
};

export const FeedItem: React.FC<FeedItemProps> = ({
  notification,
  isSelected,
  onSelect,
  onUpdate,
  showActions = true,
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
  
  const handleSave = async (save: boolean) => {
    await updateNotification(notification.id, { isArchived: save });
    toast({
        title: save ? "Notification Saved" : "Notification Unsaved",
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
        'flex items-start gap-4 p-4 border-b transition-all cursor-pointer group border-l-4',
        !notification.isRead && 'bg-primary/5 dark:bg-primary/10',
        isSelected && 'bg-primary/10 dark:bg-primary/20',
        config.border
      )}
      onClick={handleItemClick}
    >
      <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
         {showActions && (
            <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(notification.id)}
            aria-label={`Select notification: ${notification.message}`}
            />
         )}
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
      
      {showActions && (
        <div 
            className="flex items-center gap-2"
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
                    {notification.isArchived ? (
                        <DropdownMenuItem onClick={() => handleSave(false)}>
                            <ArchiveX className="mr-2 h-4 w-4" /> Unsave
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => handleSave(true)}>
                            <Star className="mr-2 h-4 w-4" /> Save
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )}
    </div>
  );
};
