
'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import type { TaskPriority } from './task-service';

export interface BacklogItem {
  id: string;
  projectId: string;
  epicId: string;
  backlogId: number;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Blocked';
  points: number;
  priority: TaskPriority;
}

const backlogItemsCollection = collection(db, 'backlogItems');

export async function getBacklogItemsForProject(projectId: string): Promise<BacklogItem[]> {
    try {
        const q = query(backlogItemsCollection, where("projectId", "==", projectId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as BacklogItem).sort((a,b) => a.backlogId - b.backlogId);
    } catch (error) {
        console.error("Error fetching backlog items for project:", error);
        return [];
    }
}

export async function createBacklogItem(itemData: Omit<BacklogItem, 'id'>): Promise<string> {
    const docRef = await addDoc(backlogItemsCollection, {});
    const newItem = { ...itemData, id: docRef.id };
    await setDoc(docRef, newItem);
    return docRef.id;
}
