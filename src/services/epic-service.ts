
'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';

export interface Epic {
  id: string;
  projectId: string;
  epicId: number;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
}

const epicsCollection = collection(db, 'epics');

export async function getEpicsForProject(projectId: string): Promise<Epic[]> {
    try {
        const q = query(epicsCollection, where("projectId", "==", projectId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Epic).sort((a,b) => a.epicId - b.epicId);
    } catch (error) {
        console.error("Error fetching epics for project:", error);
        return [];
    }
}

export async function createEpic(epicData: Omit<Epic, 'id'>): Promise<string> {
    const docRef = await addDoc(epicsCollection, {});
    const newEpic = { ...epicData, id: docRef.id };
    await setDoc(docRef, newEpic);
    return docRef.id;
}
