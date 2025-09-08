
'use client';
import { db, auth } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, writeBatch, serverTimestamp, query, orderBy, limit, where, updateDoc } from 'firebase/firestore';

export type NotificationType = 'system' | 'alert' | 'activity';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  link: string;
  isRead: boolean;
  isArchived: boolean;
  snoozedUntil: string | null;
  createdAt: string; 
}

const notificationsCollection = collection(db, 'notifications');

export async function createNotification(data: { message: string; link: string; type?: NotificationType }): Promise<string> {
    if (!auth.currentUser) {
        throw new Error("User must be logged in to create a notification.");
    }
    
    const newNotification = {
        ...data,
        userId: auth.currentUser.uid,
        type: data.type || 'activity',
        isRead: false,
        isArchived: false,
        snoozedUntil: null,
        createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(notificationsCollection, newNotification);
    return docRef.id;
}


export async function getNotifications(): Promise<Notification[]> {
    if (!auth.currentUser) {
        console.warn("No user logged in, cannot fetch notifications.");
        return [];
    }

    try {
        const q = query(
            notificationsCollection, 
            where('isArchived', '==', false),
            where('snoozedUntil', '==', null),
            orderBy('createdAt', 'desc'), 
            limit(50)
        );
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...docSnapshot.data()
        } as Notification));

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function updateNotification(id: string, data: Partial<Pick<Notification, 'isRead' | 'isArchived' | 'snoozedUntil'>>): Promise<void> {
    const docRef = doc(db, 'notifications', id);
    await updateDoc(docRef, data);
}

export async function bulkUpdateNotifications(updates: { ids: string[], data: Partial<Pick<Notification, 'isRead' | 'isArchived'>> }): Promise<void> {
    const { ids, data } = updates;
    if (ids.length === 0) return;
    
    const batch = writeBatch(db);
    ids.forEach(id => {
        const docRef = doc(db, 'notifications', id);
        batch.update(docRef, data);
    });
    await batch.commit();
}
