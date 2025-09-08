
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications, markAllNotificationsAsRead, type Notification } from '@/services/notification-service';
import { useUser } from '@/contexts/user-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CheckCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function FeedPage() {
    const router = useRouter();
    const { user } = useUser();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(true);

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

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead();
        fetchNotifications();
    };

    const handleNotificationClick = (notification: Notification) => {
        router.push(notification.link);
    };
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Communications Feed</h1>
                <p className="text-muted-foreground">All notifications, messages, and alerts in one place.</p>
            </div>
            <Separator />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Updates</CardTitle>
                    {unreadCount > 0 && (
                        <Button variant="ghost" onClick={handleMarkAllRead}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                        ) : notifications.length > 0 ? (
                            notifications.map(note => (
                                <div 
                                    key={note.id} 
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted",
                                        !note.isRead && "bg-primary-light dark:bg-primary/10 border-primary/20"
                                    )}
                                    onClick={() => handleNotificationClick(note)}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || ''} />
                                        <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className={cn("text-sm", !note.isRead && "font-semibold")}>{note.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(parseISO(note.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="text-center py-12 text-muted-foreground">
                                <p>Your feed is empty.</p>
                                <p>Important updates and notifications will appear here.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
