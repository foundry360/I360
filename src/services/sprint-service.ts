
'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

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
        const q = query(sprintsCollection, where("projectId", "==", projectId), orderBy("startDate", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Sprint);
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
