
'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, getDoc, updateDoc, deleteDoc, deleteField, writeBatch } from 'firebase/firestore';
import { createTask, deleteTaskByBacklogId, type TaskPriority, type TaskStatus, getTasksForProject } from './task-service';
import { updateProjectLastActivity } from './project-service';
import { parseISO } from 'date-fns';
import type { UserStory } from './user-story-service';
import { getProject } from './project-service';

export interface BacklogItem {
  id: string;
  projectId: string;
  epicId: string | null;
  sprintId?: string | null;
  backlogId: number;
  title: string;
  description: string;
  status: TaskStatus;
  points: number;
  priority: TaskPriority;
  owner: string;
  ownerAvatarUrl?: string;
  dueDate?: string | null;
}

const backlogItemsCollection = collection(db, 'backlogItems');

async function getNextBacklogId(projectId: string): Promise<number> {
    const q = query(backlogItemsCollection, where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return 1;
    }

    const existingIds = snapshot.docs.map(d => (d.data() as BacklogItem).backlogId);
    return Math.max(...existingIds) + 1;
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
    const nextId = await getNextBacklogId(itemData.projectId);
    const newItem = { 
        ...itemData, 
        id: docRef.id, 
        backlogId: nextId,
        epicId: itemData.epicId || null,
        owner: itemData.owner || 'Unassigned',
        ownerAvatarUrl: itemData.ownerAvatarUrl || '',
        dueDate: itemData.dueDate ? parseISO(itemData.dueDate).toISOString() : null
    };
    await setDoc(docRef, newItem);
    await updateProjectLastActivity(itemData.projectId);
    return docRef.id;
}

export async function bulkCreateBacklogItems(projectId: string, epicId: string | null, stories: (Omit<UserStory, 'createdAt'> & { createdAt: string })[]): Promise<void> {
    const project = await getProject(projectId);
    if (!project) throw new Error("Project not found");

    const batch = writeBatch(db);
    let lastBacklogId = await getNextBacklogId(projectId);

    for (const story of stories) {
        const docRef = doc(backlogItemsCollection);
        const newItem: BacklogItem = {
            id: docRef.id,
            projectId,
            epicId: epicId, // This will be null for general backlog items
            backlogId: lastBacklogId++,
            title: story.title,
            description: story.story,
            status: 'To Do',
            points: story.points || 0,
            priority: 'Medium',
            owner: project.owner,
            ownerAvatarUrl: project.ownerAvatarUrl,
            dueDate: null,
        };
        batch.set(docRef, newItem);
    }

    await batch.commit();
    await updateProjectLastActivity(projectId);
}


export async function updateBacklogItem(id: string, data: Partial<BacklogItem>): Promise<void> {
    const docRef = doc(db, 'backlogItems', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const originalData = docSnap.data() as BacklogItem;
    const wasInSprint = !!originalData.sprintId;
    const isInSprint = !!data.sprintId;

    // Handle task creation/deletion based on sprint assignment change
    if (!wasInSprint && isInSprint) {
        // Moved TO a sprint: Create a task if it doesn't exist
        const allTasks = await getTasksForProject(originalData.projectId);
        const taskExists = allTasks.some(t => t.backlogId === originalData.backlogId);
        if (!taskExists) {
            await createTask({
                projectId: originalData.projectId,
                title: originalData.title,
                status: 'To Do',
                order: 999, // Will be reordered by other logic if needed
                owner: originalData.owner,
                ownerAvatarUrl: originalData.ownerAvatarUrl,
                priority: originalData.priority,
                type: 'Execution',
                backlogId: originalData.backlogId,
                dueDate: originalData.dueDate,
            });
        }
    } else if (wasInSprint && !isInSprint) {
        // Moved FROM a sprint (back to backlog): Delete the task
        await deleteTaskByBacklogId(originalData.projectId, originalData.backlogId);
    }
    
    const { dueDate, ...restOfData } = data;
    const finalData: any = { ...restOfData };
    
    if (dueDate) {
        finalData.dueDate = parseISO(dueDate).toISOString();
    } else if (dueDate === null || dueDate === '') {
        finalData.dueDate = null;
    }

    await updateDoc(docRef, finalData);
    await updateProjectLastActivity(originalData.projectId);
}

export async function deleteBacklogItem(id: string): Promise<void> {
    const docRef = doc(db, 'backlogItems', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const item = docSnap.data() as BacklogItem;
        await deleteTaskByBacklogId(item.projectId, item.backlogId); // Also delete associated task
        await deleteDoc(docRef);
        await updateProjectLastActivity(item.projectId);
    }
}

