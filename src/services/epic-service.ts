
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

async function getNextEpicId(projectId: string): Promise<number> {
    const q = query(epicsCollection, where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return 1;
    }
    const existingIds = snapshot.docs.map(d => (d.data() as Epic).epicId);
    return Math.max(...existingIds) + 1;
}


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

export async function createEpic(epicData: Omit<Epic, 'id' | 'epicId'>): Promise<string> {
    const docRef = await addDoc(epicsCollection, {});
    const nextId = await getNextEpicId(epicData.projectId);
    const newEpic = { ...epicData, id: docRef.id, epicId: nextId };
    await setDoc(docRef, newEpic);
    return docRef.id;
}
