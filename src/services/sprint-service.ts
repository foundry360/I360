
'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { deleteTask, type Task } from './task-service';
import type { BacklogItem } from './backlog-item-service';
import { updateProjectLastActivity } from './project-service';

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
    await updateProjectLastActivity(sprintData.projectId);
    return docRef.id;
}

export async function startSprint(sprintId: string, projectId: string, sprintItems: BacklogItem[], existingTasks: Task[]): Promise<void> {
    const batch = writeBatch(db);

    // 1. Update the sprint status
    const sprintRef = doc(db, 'sprints', sprintId);
    batch.update(sprintRef, { status: 'Active' });

    // 2. Create a task for each backlog item that doesn't already have one
    sprintItems.forEach((item, index) => {
        const taskExists = existingTasks.some(task => task.backlogId === item.backlogId);
        if (!taskExists) {
            const taskRef = doc(collection(db, 'tasks'));
            const newTask: Task = {
                id: taskRef.id,
                projectId: projectId,
                title: item.title,
                status: 'To Do',
                order: index, // This might need refinement to place at the end of the To Do list
                owner: item.owner || 'Unassigned',
                ownerAvatarUrl: item.ownerAvatarUrl || '',
                priority: item.priority,
                type: 'Execution', // Default type, can be adjusted
                backlogId: item.backlogId,
                dueDate: item.dueDate
            };
            batch.set(taskRef, newTask);
        }
    });

    await batch.commit();
    await updateProjectLastActivity(projectId);
}

export async function completeSprint(sprintId: string, projectId: string): Promise<void> {
    const batch = writeBatch(db);

    // 1. Update sprint status
    const sprintRef = doc(db, 'sprints', sprintId);
    batch.update(sprintRef, { status: 'Completed' });

    // 2. Find all backlog items and tasks for the project
    const backlogQuery = query(collection(db, 'backlogItems'), where("sprintId", "==", sprintId));
    const tasksQuery = query(collection(db, 'tasks'), where("projectId", "==", projectId));
    
    const [backlogSnapshot, tasksSnapshot] = await Promise.all([getDocs(backlogQuery), getDocs(tasksQuery)]);
    
    const sprintItems = backlogSnapshot.docs.map(doc => doc.data() as BacklogItem);
    const allTasks = tasksSnapshot.docs.map(doc => doc.data() as Task);

    const sprintItemBacklogIds = sprintItems.map(item => item.backlogId);
    const tasksInSprint = allTasks.filter(task => task.backlogId && sprintItemBacklogIds.includes(task.backlogId));

    // 3. Handle incomplete tasks
    tasksInSprint.forEach(task => {
        if (task.status !== 'Complete') {
            // Find the corresponding backlog item
            const backlogItem = sprintItems.find(item => item.backlogId === task.backlogId);
            if (backlogItem) {
                // Move item back to backlog
                const backlogItemRef = doc(db, 'backlogItems', backlogItem.id);
                batch.update(backlogItemRef, { sprintId: null });
            }
            // Delete the incomplete task from the board
            const taskRef = doc(db, 'tasks', task.id);
            batch.delete(taskRef);
        }
    });

    await batch.commit();
    await updateProjectLastActivity(projectId);
}


export async function updateSprint(id: string, data: Partial<Omit<Sprint, 'id'>>): Promise<void> {
    const docRef = doc(db, 'sprints', id);
    await updateDoc(docRef, data);
    if (data.projectId) {
        await updateProjectLastActivity(data.projectId);
    }
}

export async function deleteSprint(id: string): Promise<void> {
    const batch = writeBatch(db);

    const sprintRef = doc(db, 'sprints', id);
    const sprintDoc = await getDoc(sprintRef);
    if (!sprintDoc.exists()) return;

    const projectId = sprintDoc.data().projectId;

    // 1. Find all backlog items in the sprint and move them back to the backlog
    const backlogQuery = query(collection(db, 'backlogItems'), where("sprintId", "==", id));
    const backlogSnapshot = await getDocs(backlogQuery);
    backlogSnapshot.forEach(doc => {
        batch.update(doc.ref, { sprintId: null });
    });

    // 2. Delete the sprint document itself
    batch.delete(sprintRef);

    await batch.commit();
    await updateProjectLastActivity(projectId);
}
