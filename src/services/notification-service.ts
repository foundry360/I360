
'use client';
import { db, auth } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, writeBatch, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string; 
}

const notificationsCollection = collection(db, 'notifications');

export async function createNotification(data: { message: string; link: string; }): Promise<string> {
    if (!auth.currentUser) {
        throw new Error("User must be logged in to create a notification.");
    }
    
    const newNotification = {
        ...data,
        userId: auth.currentUser.uid,
        isRead: false,
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
        const q = query(notificationsCollection, orderBy('createdAt', 'desc'), limit(20));
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

export async function markAllNotificationsAsRead(): Promise<void> {
    if (!auth.currentUser) {
        throw new Error("User must be logged in to update notifications.");
    }
    
    const q = query(notificationsCollection);
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(docSnapshot => {
        if (!docSnapshot.data().isRead) {
            batch.update(docSnapshot.ref, { isRead: true });
        }
    });

    await batch.commit();
}
