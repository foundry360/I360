
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, writeBatch, runTransaction, DocumentReference, WriteBatch, addDoc, deleteDoc } from 'firebase/firestore';

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
    await runTransaction(db, async (transaction) => {
        const tasksQuery = query(tasksCollection, where("projectId", "==", projectId));
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => doc.data() as Task);

        const taskToMove = tasks.find(t => t.id === taskId);
        if (!taskToMove) throw new Error("Task not found!");

        const oldStatus = taskToMove.status;
        const oldIndex = taskToMove.order;

        // Remove from old position
        tasks
            .filter(t => t.status === oldStatus && t.order > oldIndex)
            .forEach(t => {
                const taskRef = doc(db, "tasks", t.id);
                transaction.update(taskRef, { order: t.order - 1 });
            });

        // Add to new position
        tasks
            .filter(t => t.status === newStatus && t.order >= newIndex)
            .forEach(t => {
                const taskRef = doc(db, "tasks", t.id);
                transaction.update(taskRef, { order: t.order + 1 });
            });

        // Update the moved task
        const movedTaskRef = doc(db, "tasks", taskId);
        transaction.update(movedTaskRef, { status: newStatus, order: newIndex });
    });
}
