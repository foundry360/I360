
'use client';

import * as React from 'react';
import { getNotifications, bulkUpdateNotifications, type Notification } from '@/services/notification-service';
import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCheck, Archive, Inbox, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FeedItem } from '@/components/feed-item';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FeedPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedNotifications, setSelectedNotifications] = React.useState<string[]>([]);
    const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

    const fetchNotifications = React.useCallback(async () => {
        if (user) {
            setLoading(true);
            const notes = await getNotifications();
            setNotifications(notes);
            setLoading(false);
        }
    }, [user]);

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
    
    const filteredNotifications = notifications.filter(n => filter === 'all' || !n.isRead);
    const unreadCount = notifications.filter(n => !n.isRead).length;

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

             <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
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
                    <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-lg">
                        <div className="flex justify-center mb-4">
                            <div className="bg-primary/10 rounded-full p-3">
                                <Bell className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold">All caught up!</h3>
                        <p>Your feed is empty. New updates will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
