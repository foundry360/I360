
'use client';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, addDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import type { Company } from './company-service';

export interface Project {
  id: string;
  name: string;
  companyId: string;
  companyName?: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'On Hold';
  startDate: string;
  endDate?: string;
  owner: string; 
}

const projectsCollection = collection(db, 'projects');

export async function getProjects(): Promise<Project[]> {
    try {
        const companySnapshot = await getDocs(collection(db, 'companies'));
        const companyMap = new Map(companySnapshot.docs.map(doc => [doc.id, (doc.data() as Company).name]));

        const projectSnapshot = await getDocs(projectsCollection);
        
        const projects = projectSnapshot.docs.map(docSnapshot => {
            const project = { id: docSnapshot.id, ...docSnapshot.data() } as Project;
            if (project.companyId) {
                project.companyName = companyMap.get(project.companyId) || 'Unknown Company';
            }
            return project;
        });

        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export async function createProject(projectData: Omit<Project, 'id' | 'companyName'>): Promise<string> {
  const docRef = await addDoc(projectsCollection, {});
  const newProject = { ...projectData, id: docRef.id };
  await setDoc(docRef, newProject);
  return docRef.id;
}

export async function deleteProject(id: string): Promise<void> {
    const docRef = doc(db, 'projects', id);
    await deleteDoc(docRef);
}

export async function deleteProjects(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const docRef = doc(db, 'projects', id);
      batch.delete(docRef);
    });
    await batch.commit();
}
