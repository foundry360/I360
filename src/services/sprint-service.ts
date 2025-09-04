
'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { createTask, type Task } from './task-service';
import type { BacklogItem } from './backlog-item-service';

export type SprintStatus = 'Not Started' | 'Active' | 'Completed';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  status: SprintStatus;
}

const sprintsCollection = collection(db, 'sprints');

export async function getSprintsForProject(projectId: string): Promise<Sprint[]> {
    try {
        const q = query(sprintsCollection, where("projectId", "==", projectId));
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => doc.data() as Sprint)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } catch (error) {
        console.error("Error fetching sprints for project:", error);
        return [];
    }
}

export async function createSprint(sprintData: Omit<Sprint, 'id'>): Promise<string> {
    const docRef = await addDoc(sprintsCollection, {});
    const newSprint = { ...sprintData, id: docRef.id };
    await setDoc(docRef, newSprint);
    return docRef.id;
}

export async function startSprint(sprintId: string, projectId: string, sprintItems: BacklogItem[]): Promise<void> {
    const batch = writeBatch(db);

    // 1. Update the sprint status
    const sprintRef = doc(db, 'sprints', sprintId);
    batch.update(sprintRef, { status: 'Active' });

    // 2. Create a task for each backlog item
    sprintItems.forEach((item, index) => {
        const taskRef = doc(collection(db, 'tasks'));
        const newTask: Task = {
            id: taskRef.id,
            projectId: projectId,
            title: item.title,
            status: 'To Do',
            order: index, // Initial order in the "To Do" column
            owner: item.owner || 'Unassigned',
            ownerAvatarUrl: item.ownerAvatarUrl || '',
            priority: item.priority,
            type: 'Execution', // Default type, can be adjusted
            backlogId: item.backlogId,
        };
        batch.set(taskRef, newTask);
    });

    await batch.commit();
}


export async function updateSprint(id: string, data: Partial<Sprint>): Promise<void> {
    const docRef = doc(db, 'sprints', id);
    await updateDoc(docRef, data);
}

export async function deleteSprint(id: string): Promise<void> {
    // Note: This does not automatically reassign backlog items.
    // That logic should be handled in the component calling this function.
    const docRef = doc(db, 'sprints', id);
    await deleteDoc(docRef);
}
