
'use client';

import * as React from 'react';
import { getNotifications, bulkUpdateNotifications, type Notification, NotificationType } from '@/services/notification-service';
import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCheck, Archive, Inbox, Bell, AtSign, MessageSquare, AlertTriangle, Info, Star, MonitorCog, ArchiveX, Rss } from 'lucide-react';
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

const filterConfig: { id: FilterType; label: string; icon: React.ElementType, color: string, bgColor: string }[] = [
    { id: 'all', label: 'All', icon: Inbox, color: 'text-slate-500', bgColor: 'bg-slate-500' },
    { id: 'activity', label: 'Notifications', icon: Bell, color: 'text-orange-500', bgColor: 'bg-orange-500' },
    { id: 'mention', label: '@Mentions', icon: AtSign, color: 'text-blue-500', bgColor: 'bg-blue-500' },
    { id: 'thread', label: 'Threads', icon: MessageSquare, color: 'text-green-500', bgColor: 'bg-green-500' },
    { id: 'alert', label: 'Alerts', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500' },
    { id: 'system', label: 'System', icon: MonitorCog, color: 'text-purple-500', bgColor: 'bg-purple-500' },
];

const savedFilter = { id: 'saved' as const, label: 'Saved', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-500' };

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

    const handleBulkSave = async (save: boolean) => {
        const idsToUpdate = selectedNotifications.length > 0 ? selectedNotifications : (activeFilter === 'saved' ? notifications.map(n => n.id) : notifications.filter(n => n.isRead).map(n => n.id));
        await bulkUpdateNotifications({ ids: idsToUpdate, data: { isArchived: save }});
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
    
    const renderFilterButton = (filter: { id: FilterType; label: string; icon: React.ElementType, color: string, bgColor: string }) => {
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
                 <div className={cn("flex items-center justify-center h-6 w-6 rounded-md mr-3", filter.bgColor)}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
                {filter.label}
            </Button>
        );
    };

    const getEmptyStateContent = () => {
        const currentFilterConfig = filterConfig.find(f => f.id === activeFilter) || savedFilter;
        const filterName = currentFilterConfig.label.toLowerCase();

        switch (activeFilter) {
            case 'saved':
                return {
                    title: "No saved items",
                    message: "Saved notifications will appear here"
                };
            case 'all':
                return {
                    title: "All caught up!",
                    message: "Your feed is empty. Important updates will appear here"
                };
            case 'system':
                 return {
                    title: "All caught up!",
                    message: `Your system notifications are empty. Important updates will appear here`
                };
            case 'mention':
                 return {
                    title: "All caught up!",
                    message: `You have no new @mentions. Important updates will appear here`
                };
            default:
                return {
                    title: "All caught up!",
                    message: `Your ${filterName} are empty. Important updates will appear here`
                };
        }
    };
    
    const emptyState = getEmptyStateContent();

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
                             {activeFilter === 'saved' ? (
                                <Button variant="outline" onClick={() => handleBulkSave(false)}>Unsave ({selectedNotifications.length})</Button>
                            ) : (
                                <Button variant="outline" onClick={() => handleBulkSave(true)}>Save ({selectedNotifications.length})</Button>
                            )}
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
                                {activeFilter === 'saved' ? (
                                     <DropdownMenuItem onClick={() => handleBulkSave(false)} disabled={notifications.length === 0}>
                                        <ArchiveX className="mr-2 h-4 w-4" /> Unsave all
                                    </DropdownMenuItem>
                                ) : (
                                     <DropdownMenuItem onClick={() => handleBulkSave(true)} disabled={notifications.length === unreadCount}>
                                        <Star className="mr-2 h-4 w-4" /> Save all read
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
            <Separator />
             <div className="grid grid-cols-12 gap-8">
                <div className="col-span-2">
                    <nav className="space-y-1">
                        {renderFilterButton(savedFilter)}
                    </nav>
                    <Separator className="my-4" />
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2 mb-4">FILTERS</h4>
                    <nav className="space-y-1">
                        {renderFilterButton(filterConfig.find(f => f.id === 'all')!)}
                        {renderFilterButton(filterConfig.find(f => f.id === 'activity')!)}
                        {renderFilterButton(filterConfig.find(f => f.id === 'mention')!)}
                        {renderFilterButton(filterConfig.find(f => f.id === 'thread')!)}
                        {renderFilterButton(filterConfig.find(f => f.id === 'alert')!)}
                        {renderFilterButton(filterConfig.find(f => f.id === 'system')!)}
                    </nav>
                </div>
                <div className="col-span-10">
                    
                        {loading ? (
                           <Card className="overflow-hidden">
                            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full border-b" />)}
                           </Card>
                        ) : filteredNotifications.length > 0 ? (
                             <Card className="overflow-hidden">
                                {filteredNotifications.map(note => (
                                    <FeedItem 
                                        key={note.id}
                                        notification={note}
                                        isSelected={selectedNotifications.includes(note.id)}
                                        onSelect={handleSelectNotification}
                                        onUpdate={fetchNotifications}
                                    />
                                ))}
                            </Card>
                        ) : (
                             <div className="p-10 text-center rounded-lg border-2 border-dashed border-border bg-transparent shadow-none">
                                <div className="flex justify-center mb-4">
                                   <div className="flex justify-center items-center h-16 w-16 text-muted-foreground">
                                       <Rss className="h-8 w-8" />
                                   </div>
                               </div>
                               <h3 className="text-lg font-semibold text-foreground">
                                 {emptyState.title}
                               </h3>
                               <p className="text-muted-foreground mt-2">
                                 {emptyState.message}
                               </p>
                           </div>
                        )}
                </div>
            </div>
        </div>
    );
}
