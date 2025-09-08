
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, writeBatch, runTransaction, DocumentReference, WriteBatch, addDoc, deleteDoc, getDoc, deleteField, onSnapshot } from 'firebase/firestore';
import type { BacklogItem } from './backlog-item-service';
import { updateProjectLastActivity } from './project-service';
import { createNotification } from './notification-service';

export const TaskStatus = {
  ToDo: 'To Do',
  InProgress: 'In Progress',
  InReview: 'In Review',
  NeedsRevision: 'Needs Revision',
  FinalApproval: 'Final Approval',
  Complete: 'Complete'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

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
  description?: string;
  status: TaskStatus;
  order: number;
  owner: string;
  ownerAvatarUrl: string;
  priority: TaskPriority;
  type: TaskType;
  backlogId?: number;
  dueDate?: string | null;
};

const tasksCollection = collection(db, 'tasks');

export function getTasks(onUpdate: (tasks: Task[]) => void): () => void {
    const q = query(tasksCollection);
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => doc.data() as Task);
        onUpdate(tasks);
    }, (error) => {
        console.error("Error fetching tasks in real-time:", error);
    });
    return unsubscribe;
}

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
  const newTask: Task = { 
    ...taskData, 
    id: docRef.id
  };

  if (newTask.dueDate === undefined) {
    newTask.dueDate = null;
  }
  
  await setDoc(docRef, newTask);
  
  await createNotification({
    message: `New task "${newTask.title}" assigned to ${newTask.owner}.`,
    link: `/dashboard/projects/${newTask.projectId}`,
    type: 'activity',
  });

  await updateProjectLastActivity(taskData.projectId);
  return docRef.id;
}


export async function updateTask(id: string, taskData: Partial<Omit<Task, 'id'>>): Promise<void> {
    const docRef = doc(db, 'tasks', id);
    const taskDoc = await getDoc(docRef);
    if (!taskDoc.exists()) {
        throw new Error("Task not found");
    }

    const originalTask = taskDoc.data() as Task;
    const projectId = taskData.projectId || originalTask.projectId;
    
    // Update the task itself
    await updateDoc(docRef, taskData);

    // If the task is linked to a backlog item, update the backlog item too
    if (originalTask.backlogId) {
        const backlogQuery = query(collection(db, 'backlogItems'), where("projectId", "==", projectId), where("backlogId", "==", originalTask.backlogId));
        const backlogSnapshot = await getDocs(backlogQuery);
        if (!backlogSnapshot.empty) {
            const backlogItemRef = backlogSnapshot.docs[0].ref;
            const backlogUpdateData: Partial<Omit<BacklogItem, 'id'>> = {};
            if (taskData.status) backlogUpdateData.status = taskData.status;

            if (taskData.hasOwnProperty('dueDate')) {
                backlogUpdateData.dueDate = taskData.dueDate || null;
            }

            if (taskData.description) backlogUpdateData.description = taskData.description;
            
            if (taskData.owner) backlogUpdateData.owner = taskData.owner;
            if (taskData.ownerAvatarUrl) backlogUpdateData.ownerAvatarUrl = taskData.ownerAvatarUrl;


            if (Object.keys(backlogUpdateData).length > 0) {
                 await updateDoc(backlogItemRef, backlogUpdateData);
            }
        }
    }
    
    await updateProjectLastActivity(projectId);
}

export async function deleteTask(id: string): Promise<void> {
    const docRef = doc(db, 'tasks', id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        const projectId = docSnap.data().projectId;
        await deleteDoc(docRef);
        await updateProjectLastActivity(projectId);
    }
}

export async function deleteTaskByBacklogId(projectId: string, backlogId: number): Promise<void> {
    const q = query(tasksCollection, where("projectId", "==", projectId), where("backlogId", "==", backlogId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        await updateProjectLastActivity(projectId);
    }
}


export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const docRef = doc(db, 'tasks', id);
    const taskDoc = await getDoc(docRef);
    await updateDoc(docRef, { status });
    if(taskDoc.exists()){
        await updateProjectLastActivity(taskDoc.data().projectId);
    }
}

export async function updateTaskOrderAndStatus(taskId: string, newStatus: TaskStatus, newIndex: number, projectId: string): Promise<void> {
    const tasksQuery = query(tasksCollection, where("projectId", "==", projectId));
    
    await runTransaction(db, async (transaction) => {
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        const taskToMove = tasks.find(t => t.id === taskId);
        if (!taskToMove) throw new Error("Task not found!");

        const oldStatus = taskToMove.status;
        const oldIndex = taskToMove.order;

        tasks
            .filter(t => t.id !== taskId && t.status === oldStatus && t.order > oldIndex)
            .forEach(t => {
                const taskRef = doc(db, "tasks", t.id);
                transaction.update(taskRef, { order: t.order - 1 });
            });

        tasks
            .filter(t => t.id !== taskId && t.status === newStatus && t.order >= newIndex)
            .forEach(t => {
                const taskRef = doc(db, "tasks", t.id);
                transaction.update(taskRef, { order: t.order + 1 });
            });

        const movedTaskRef = doc(db, "tasks", taskId);
        transaction.update(movedTaskRef, { status: newStatus, order: newIndex });
        
        if (taskToMove.backlogId) {
            const backlogQuery = query(collection(db, 'backlogItems'), where("projectId", "==", projectId), where("backlogId", "==", taskToMove.backlogId));
            const backlogSnapshot = await getDocs(backlogQuery);
            if (!backlogSnapshot.empty) {
                const backlogItemRef = backlogSnapshot.docs[0].ref;
                transaction.update(backlogItemRef, { status: newStatus });
            }
        }
    });

    const taskToMoveDoc = await getDoc(doc(db, "tasks", taskId));
    const taskToMove = taskToMoveDoc.data() as Task | undefined;

    if (taskToMove && taskToMove.status !== newStatus) {
        let message = `Task "${taskToMove.title}" was moved to ${newStatus}.`;
        if (newStatus === 'Complete') {
            message = `Task "${taskToMove.title}" has been completed.`;
        }

        await createNotification({
            message,
            link: `/dashboard/projects/${projectId}`,
            type: newStatus === 'Complete' ? 'activity' : 'system'
        });
    }
    
    await updateProjectLastActivity(projectId);
}

    