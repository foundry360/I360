

'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, getDoc, updateDoc, deleteDoc, deleteField, writeBatch, runTransaction, onSnapshot } from 'firebase/firestore';
import { updateProjectLastActivity } from './project-service';
import { parseISO } from 'date-fns';
import type { UserStory } from './user-story-service';
import { getProject } from './project-service';
import { getDoc as getStoryDoc } from 'firebase/firestore';
import type { StoryCollection } from './collection-service';

export const BacklogItemStatus = {
  ToDo: 'To Do',
  InProgress: 'In Progress',
  InReview: 'In Review',
  NeedsRevision: 'Needs Revision',
  FinalApproval: 'Final Approval',
  Complete: 'Complete'
} as const;
export type BacklogItemStatus = typeof BacklogItemStatus[keyof typeof BacklogItemStatus];

export enum BacklogItemPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}
export type BacklogItemPriorityType = `${BacklogItemPriority}`;


export type BacklogItemType = 'Assessment' | 'Workshop' | 'Enablement' | 'Planning' | 'Execution' | 'Review';


export interface BacklogItem {
  id: string;
  projectId: string;
  epicId: string | null;
  sprintId?: string | null;
  backlogId: number;
  title: string;
  description: string;
  status: BacklogItemStatus;
  points: number;
  priority: BacklogItemPriorityType;
  owner: string;
  ownerAvatarUrl?: string;
  dueDate?: string | null;
  order: number;
  type: BacklogItemType;
}

const backlogItemsCollection = collection(db, 'backlogItems');

export function getBacklogItems(onUpdate: (items: BacklogItem[]) => void): () => void {
    const q = query(backlogItemsCollection);
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data() as BacklogItem);
        onUpdate(items);
    }, (error) => {
        console.error("Error in getBacklogItems listener:", error);
    });
    return unsubscribe;
}


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

export async function createBacklogItem(itemData: Omit<BacklogItem, 'id' | 'backlogId' | 'order' | 'type'>): Promise<string> {
    const docRef = await addDoc(backlogItemsCollection, {});
    const nextId = await getNextBacklogId(itemData.projectId);
    const newItem = { 
        ...itemData, 
        id: docRef.id, 
        backlogId: nextId,
        epicId: itemData.epicId || null,
        owner: itemData.owner || 'Unassigned',
        ownerAvatarUrl: itemData.ownerAvatarUrl || '',
        dueDate: itemData.dueDate ? parseISO(itemData.dueDate).toISOString() : null,
        order: 999, // Default order
        type: 'Execution' as BacklogItemType, // Default type
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
            order: 999,
            type: 'Execution',
        };
        batch.set(docRef, newItem);
    }

    await batch.commit();
    await updateProjectLastActivity(projectId);
}

export async function addCollectionToProjectBacklog(projectId: string, collectionId: string): Promise<void> {
    const project = await getProject(projectId);
    if (!project) throw new Error("Project not found");

    const collectionRef = doc(db, 'storyCollections', collectionId);
    const collectionSnap = await getDoc(collectionRef);
    if (!collectionSnap.exists()) throw new Error("Collection not found");

    const collectionData = collectionSnap.data() as StoryCollection;
    
    if (collectionData.userStoryIds.length === 0) {
        return; // Nothing to add
    }

    const storyDocs = await Promise.all(
        collectionData.userStoryIds.map(storyId => getDoc(doc(db, 'userStories', storyId)))
    );

    const stories = storyDocs
        .filter(docSnap => docSnap.exists())
        .map(docSnap => docSnap.data() as UserStory);

    const batch = writeBatch(db);
    let lastBacklogId = await getNextBacklogId(projectId);

    for (const story of stories) {
        const docRef = doc(backlogItemsCollection);
        const newItem: BacklogItem = {
            id: docRef.id,
            projectId,
            epicId: null, // Imported stories don't have an epic by default
            backlogId: lastBacklogId++,
            title: story.title,
            description: story.story,
            status: 'To Do',
            points: story.points || 0,
            priority: 'Medium',
            owner: project.owner,
            ownerAvatarUrl: project.ownerAvatarUrl,
            dueDate: null,
            order: 999,
            type: 'Execution',
        };
        batch.set(docRef, newItem);
    }

    await batch.commit();
    await updateProjectLastActivity(projectId);
}

export async function addCollectionsToProjectBacklog(projectId: string, collectionIds: string[]): Promise<void> {
    const project = await getProject(projectId);
    if (!project) throw new Error("Project not found");

    const batch = writeBatch(db);
    let lastBacklogId = await getNextBacklogId(projectId);

    for (const collectionId of collectionIds) {
        const collectionRef = doc(db, 'storyCollections', collectionId);
        const collectionSnap = await getDoc(collectionRef);

        if (collectionSnap.exists()) {
            const collectionData = collectionSnap.data() as StoryCollection;
            if (collectionData.userStoryIds.length === 0) continue;

            const storyDocs = await Promise.all(
                collectionData.userStoryIds.map(storyId => getDoc(doc(db, 'userStories', storyId)))
            );

            const stories = storyDocs
                .filter(docSnap => docSnap.exists())
                .map(docSnap => docSnap.data() as UserStory);

            for (const story of stories) {
                const docRef = doc(backlogItemsCollection);
                const newItem: BacklogItem = {
                    id: docRef.id,
                    projectId,
                    epicId: null,
                    backlogId: lastBacklogId++,
                    title: story.title,
                    description: story.story,
                    status: 'To Do',
                    points: story.points || 0,
                    priority: 'Medium',
                    owner: project.owner,
                    ownerAvatarUrl: project.ownerAvatarUrl,
                    dueDate: null,
                    order: 999,
                    type: 'Execution',
                };
                batch.set(docRef, newItem);
            }
        }
    }

    await batch.commit();
    await updateProjectLastActivity(projectId);
}


export async function updateBacklogItem(id: string, data: Partial<Omit<BacklogItem, 'id'>>): Promise<void> {
    const docRef = doc(db, 'backlogItems', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const originalData = docSnap.data() as BacklogItem;
    
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

export async function updateBacklogItemOrderAndStatus(itemId: string, newStatus: BacklogItemStatus, newIndex: number, projectId: string): Promise<void> {
    if (!projectId) {
        console.error("updateBacklogItemOrderAndStatus called with undefined projectId");
        return;
    }
    await runTransaction(db, async (transaction) => {
        const allItemsQuery = query(collection(db, "backlogItems"), where("projectId", "==", projectId));
        const allItemsSnapshot = await getDocs(allItemsQuery);
        const allItems = allItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BacklogItem));

        const itemToMove = allItems.find(i => i.id === itemId);

        if (!itemToMove) {
            throw new Error("Backlog item not found");
        }

        const oldStatus = itemToMove.status;
        const oldIndex = itemToMove.order;

        // Decrement order for items in old column that were after the moved item
        allItems
            .filter(i => i.id !== itemId && i.status === oldStatus && i.order > oldIndex)
            .forEach(i => {
                const itemRef = doc(db, 'backlogItems', i.id);
                transaction.update(itemRef, { order: i.order - 1 });
            });

        // Increment order for items in new column at or after the new index
        allItems
            .filter(i => i.status === newStatus && i.order >= newIndex)
            .forEach(i => {
                const itemRef = doc(db, 'backlogItems', i.id);
                transaction.update(itemRef, { order: i.order + 1 });
            });
        
        // Update the moved item
        const movedItemRef = doc(db, 'backlogItems', itemId);
        transaction.update(movedItemRef, { status: newStatus, order: newIndex });
    });
    await updateProjectLastActivity(projectId);
}


export async function deleteBacklogItem(id: string): Promise<void> {
    const docRef = doc(db, 'backlogItems', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const item = docSnap.data() as BacklogItem;
        await deleteDoc(docRef);
        await updateProjectLastActivity(item.projectId);
    }
}
