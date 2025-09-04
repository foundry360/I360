
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, writeBatch, runTransaction, DocumentReference, WriteBatch, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { BacklogItem } from './backlog-item-service';

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Needs Revisions' | 'Final Approval' | 'Complete';

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export type TaskType = 'Assessment' | 'Workshop' | 'Enablement' | 'Planning' | 'Execution' | 'Review';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  order: number;
  owner: string;
  ownerAvatarUrl: string;
  priority: TaskPriority;
  type: TaskType;
  backlogId?: number;
};

const tasksCollection = collection(db, 'tasks');

export async function getTasksForProject(projectId: string): Promise<Task[]> {
    try {
        const q = query(tasksCollection, where("projectId", "==", projectId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
        console.error("Error fetching tasks for project:", error);
        return [];
    }
}

export async function createTask(taskData: Omit<Task, 'id'>): Promise<string> {
  const docRef = await addDoc(tasksCollection, {});
  const newTask: Task = { ...taskData, id: docRef.id };
  await setDoc(docRef, newTask);
  return docRef.id;
}


export async function updateTask(id: string, taskData: Partial<Omit<Task, 'id'>>): Promise<void> {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, taskData);
}

export async function deleteTask(id: string): Promise<void> {
    const docRef = doc(db, 'tasks', id);
    await deleteDoc(docRef);
}


export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, { status });
}

export async function updateTaskOrderAndStatus(taskId: string, newStatus: TaskStatus, newIndex: number, projectId: string): Promise<void> {
    // First, fetch all tasks for the project outside the transaction.
    const tasksQuery = query(tasksCollection, where("projectId", "==", projectId));
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

    await runTransaction(db, async (transaction) => {
        const taskToMove = tasks.find(t => t.id === taskId);
        if (!taskToMove) throw new Error("Task not found!");

        const oldStatus = taskToMove.status;
        const oldIndex = taskToMove.order;

        // Decrement order for tasks in the old column that were after the moved task
        tasks
            .filter(t => t.id !== taskId && t.status === oldStatus && t.order > oldIndex)
            .forEach(t => {
                const taskRef = doc(db, "tasks", t.id);
                transaction.update(taskRef, { order: t.order - 1 });
            });

        // Increment order for tasks in the new column that are at or after the new index
        tasks
            .filter(t => t.id !== taskId && t.status === newStatus && t.order >= newIndex)
            .forEach(t => {
                const taskRef = doc(db, "tasks", t.id);
                transaction.update(taskRef, { order: t.order + 1 });
            });

        // Update the moved task's status and order
        const movedTaskRef = doc(db, "tasks", taskId);
        transaction.update(movedTaskRef, { status: newStatus, order: newIndex });
        
        // Update the corresponding backlog item's status
        if (taskToMove.backlogId) {
            const backlogQuery = query(collection(db, 'backlogItems'), where("projectId", "==", projectId), where("backlogId", "==", taskToMove.backlogId));
            const backlogSnapshot = await getDocs(backlogQuery); // Fetch inside transaction is ok if we re-read, but getDocs might not be. Let's fetch outside.
            
            if (!backlogSnapshot.empty) {
                const backlogDoc = backlogSnapshot.docs[0];
                let backlogStatus: BacklogItem['status'] = 'In Progress';
                if (newStatus === 'To Do') {
                    backlogStatus = 'To Do';
                } else if (newStatus === 'Complete') {
                    backlogStatus = 'Done';
                }
                transaction.update(backlogDoc.ref, { status: backlogStatus });
            }
        }
    });
}
