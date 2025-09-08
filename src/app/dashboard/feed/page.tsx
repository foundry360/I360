
'use client';

import * as React from 'react';
import { getNotifications, bulkUpdateNotifications, type Notification, NotificationType } from '@/services/notification-service';
import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCheck, Archive, Inbox, Bell, AtSign, MessageSquare, AlertCircle, Info, Star, MonitorCog } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FeedItem } from '@/components/feed-item';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type FilterType = 'all' | NotificationType | 'mention' | 'thread' | 'saved';

const filterConfig: { id: FilterType; label: string; icon: React.ElementType, color: string }[] = [
    { id: 'all', label: 'All', icon: Inbox, color: 'text-slate-500' },
    { id: 'mention', label: '@Mentions', icon: AtSign, color: 'text-blue-500' },
    { id: 'thread', label: 'Threads', icon: MessageSquare, color: 'text-green-500' },
    { id: 'activity', label: 'Notifications', icon: Bell, color: 'text-orange-500' },
    { id: 'alert', label: 'Alerts', icon: AlertCircle, color: 'text-red-500' },
    { id: 'system', label: 'System', icon: MonitorCog, color: 'text-sky-500' },
];

const savedFilter = { id: 'saved' as const, label: 'Saved', icon: Star, color: 'text-yellow-500' };

export default function FeedPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedNotifications, setSelectedNotifications] = React.useState<string[]>([]);
    const [activeFilter, setActiveFilter] = React.useState<FilterType>('all');

    const fetchNotifications = React.useCallback(async () => {
        if (user) {
            setLoading(true);
            const includeArchived = activeFilter === 'saved';
            const notes = await getNotifications(includeArchived);
            setNotifications(notes);
            setLoading(false);
        }
    }, [user, activeFilter]);

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleBulkMarkRead = async () => {
        const idsToUpdate = selectedNotifications.length > 0 ? selectedNotifications : notifications.filter(n => !n.isRead).map(n => n.id);
        await bulkUpdateNotifications({ ids: idsToUpdate, data: { isRead: true }});
        await fetchNotifications();
        setSelectedNotifications([]);
    };

    const handleBulkArchive = async () => {
        const idsToUpdate = selectedNotifications.length > 0 ? selectedNotifications : notifications.filter(n => n.isRead).map(n => n.id);
        await bulkUpdateNotifications({ ids: idsToUpdate, data: { isArchived: true }});
        await fetchNotifications();
        setSelectedNotifications([]);
    };

    const handleSelectNotification = (id: string) => {
        setSelectedNotifications(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    
    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'saved') {
            return n.isArchived;
        }
        if (activeFilter === 'all') return !n.isArchived;
        if (activeFilter === 'mention' || activeFilter === 'thread') {
             return n.type === activeFilter && !n.isArchived;
        }
        return n.type === activeFilter && !n.isArchived;
    });

    const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
    
    const renderFilterButton = (filter: { id: FilterType; label: string; icon: React.ElementType, color: string }) => {
        const Icon = filter.icon;
        return (
            <Button 
                key={filter.id} 
                variant="ghost" 
                className={cn(
                    "w-full justify-start",
                    activeFilter === filter.id && "bg-muted font-bold"
                )}
                onClick={() => setActiveFilter(filter.id)}
            >
                <Icon className={cn("mr-3 h-4 w-4", filter.color)} />
                {filter.label}
            </Button>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Communications Feed</h1>
                    <p className="text-muted-foreground">All notifications, messages, and alerts in one place</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedNotifications.length > 0 ? (
                        <>
                            <Button variant="outline" onClick={handleBulkMarkRead}>Mark as Read ({selectedNotifications.length})</Button>
                            <Button variant="outline" onClick={handleBulkArchive}>Archive ({selectedNotifications.length})</Button>
                        </>
                    ) : (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Bulk Actions</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleBulkMarkRead} disabled={unreadCount === 0}>
                                    <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleBulkArchive} disabled={notifications.length === unreadCount}>
                                    <Archive className="mr-2 h-4 w-4" /> Archive all read
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
            <Separator />
             <div className="grid grid-cols-12 gap-8">
                <div className="col-span-2">
                    <div className="p-4 rounded-lg">
                        <nav className="space-y-1">
                            {renderFilterButton(savedFilter)}
                        </nav>
                        <Separator className="my-4" />
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2 mb-4">Filters</h4>
                        <nav className="space-y-1">
                            {filterConfig.map(renderFilterButton)}
                        </nav>
                    </div>
                </div>
                <div className="col-span-10">
                    <Card className="overflow-hidden">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full border-b" />)
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map(note => (
                                <FeedItem 
                                    key={note.id}
                                    notification={note}
                                    isSelected={selectedNotifications.includes(note.id)}
                                    onSelect={handleSelectNotification}
                                    onUpdate={fetchNotifications}
                                />
                            ))
                        ) : (
                            <div className="text-center py-24 text-muted-foreground">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-primary/10 rounded-full p-3">
                                        <Bell className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold">
                                  {activeFilter === 'saved' ? "No saved items" : "All caught up!"}
                                </h3>
                                <p>
                                  {activeFilter === 'saved'
                                    ? 'Archived notifications will appear here'
                                    : 'Your feed is empty. Important updates will appear here'}
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
