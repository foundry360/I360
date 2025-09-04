
'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteTaskByBacklogId, type TaskPriority, type TaskStatus } from './task-service';

export interface BacklogItem {
  id: string;
  projectId: string;
  epicId: string;
  sprintId?: string | null;
  backlogId: number;
  title: string;
  description: string;
  status: TaskStatus;
  points: number;
  priority: TaskPriority;
  owner: string;
  ownerAvatarUrl?: string;
}

const backlogItemsCollection = collection(db, 'backlogItems');

async function getNextBacklogId(projectId: string, epicId: string): Promise<number> {
    const epicDocRef = doc(db, 'epics', epicId);
    const epicDoc = await getDoc(epicDocRef);
    if (!epicDoc.exists()) {
        throw new Error("Epic not found");
    }
    const epicData = epicDoc.data();
    const epicNumber = epicData.epicId;

    const q = query(backlogItemsCollection, where("projectId", "==", projectId), where("epicId", "==", epicId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return parseFloat(`${epicNumber}.1`);
    }

    const existingIds = snapshot.docs.map(d => (d.data() as BacklogItem).backlogId);
    const maxId = Math.max(...existingIds);
    const fractionalPart = maxId.toString().split('.')[1] || '0';
    const nextFractional = parseInt(fractionalPart, 10) + 1;
    
    return parseFloat(`${epicNumber}.${nextFractional}`);
}

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

export async function createBacklogItem(itemData: Omit<BacklogItem, 'id' | 'backlogId'>): Promise<string> {
    const docRef = await addDoc(backlogItemsCollection, {});
    const nextId = await getNextBacklogId(itemData.projectId, itemData.epicId);
    const newItem = { ...itemData, id: docRef.id, backlogId: nextId };
    await setDoc(docRef, newItem);
    return docRef.id;
}

export async function updateBacklogItem(id: string, data: Partial<BacklogItem>): Promise<void> {
    const docRef = doc(db, 'backlogItems', id);
    
    // Check if item is being moved back to backlog
    if (data.sprintId === null) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const originalData = docSnap.data() as BacklogItem;
            if (originalData.sprintId && originalData.backlogId) {
                // Item had a sprintId and is now being moved to backlog, so delete the task
                await deleteTaskByBacklogId(originalData.projectId, originalData.backlogId);
            }
        }
    }
    
    await updateDoc(docRef, data);
}

export async function deleteBacklogItem(id: string): Promise<void> {
    const docRef = doc(db, 'backlogItems', id);
    await deleteDoc(docRef);
}
