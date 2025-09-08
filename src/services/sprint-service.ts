
'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import type { BacklogItem } from './backlog-item-service';
import { updateProjectLastActivity } from './project-service';
import { createNotification } from './notification-service';

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

export async function startSprint(sprintId: string, projectId: string, sprintItems: BacklogItem[]): Promise<void> {
    const batch = writeBatch(db);
    const sprintRef = doc(db, 'sprints', sprintId);

    // Update the sprint status to Active
    batch.update(sprintRef, { status: 'Active' });

    // Update the status of each backlog item to 'To Do'
    sprintItems.forEach(item => {
        const itemRef = doc(db, 'backlogItems', item.id);
        batch.update(itemRef, { status: 'To Do', order: 0 }); // Reset order
    });

    await batch.commit();

    // Create notification
    const sprintDoc = await getDoc(sprintRef);
    if(sprintDoc.exists()) {
        const sprintName = sprintDoc.data().name;
        await createNotification({
            message: `Wave "${sprintName}" has kicked off.`,
            link: `/dashboard/projects/${projectId}`,
            type: 'activity',
        });
    }

    await updateProjectLastActivity(projectId);
}

export async function completeSprint(sprintId: string, projectId: string): Promise<void> {
    const batch = writeBatch(db);

    const sprintRef = doc(db, 'sprints', sprintId);
    
    // Update sprint status
    batch.update(sprintRef, { status: 'Completed' });

    // Mark all incomplete items in the sprint as 'To Do' and move them back to the backlog
    const backlogQuery = query(collection(db, 'backlogItems'), where("sprintId", "==", sprintId));
    const backlogSnapshot = await getDocs(backlogQuery);

    backlogSnapshot.docs.forEach(docSnapshot => {
        const item = docSnapshot.data() as BacklogItem;
        if(item.status !== 'Complete') {
            batch.update(docSnapshot.ref, { status: 'To Do', sprintId: null });
        }
    });

    await batch.commit();

    // Create notification
    const sprintDoc = await getDoc(sprintRef);
    if(sprintDoc.exists()) {
        const sprintName = sprintDoc.data().name;
        await createNotification({
            message: `Wave "${sprintName}" has been completed.`,
            link: `/dashboard/projects/${projectId}`,
            type: 'activity',
        });
    }

    await updateProjectLastActivity(projectId);
}


export async function updateSprint(id: string, data: Partial<Omit<Sprint, 'id'>>): Promise<void> {
    const docRef = doc(db, 'sprints', id);
    const originalSprintDoc = await getDoc(docRef);
    if (!originalSprintDoc.exists()) return;

    await updateDoc(docRef, data);
    
    const originalSprint = originalSprintDoc.data();
    if(data.startDate !== originalSprint.startDate || data.endDate !== originalSprint.endDate) {
        await createNotification({
            message: `The timeline for wave "${originalSprint.name}" has been adjusted.`,
            link: `/dashboard/projects/${originalSprint.projectId}`,
            type: 'alert',
        });
    }

    if (data.projectId) {
        await updateProjectLastActivity(data.projectId);
    } else {
        await updateProjectLastActivity(originalSprint.projectId);
    }
}

export async function deleteSprint(id: string): Promise<void> {
    const batch = writeBatch(db);

    const sprintRef = doc(db, 'sprints', id);
    const sprintDoc = await getDoc(sprintRef);
    if (!sprintDoc.exists()) return;

    const projectId = sprintDoc.data().projectId;

    // Find all backlog items in the sprint and move them back to the backlog
    const backlogQuery = query(collection(db, 'backlogItems'), where("sprintId", "==", id));
    const backlogSnapshot = await getDocs(backlogQuery);
    backlogSnapshot.forEach(doc => {
        batch.update(doc.ref, { sprintId: null });
    });

    // Delete the sprint document itself
    batch.delete(sprintRef);

    await batch.commit();
    await updateProjectLastActivity(projectId);
}
