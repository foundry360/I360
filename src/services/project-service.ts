
'use client';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, addDoc, writeBatch, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import type { Company } from './company-service';

export interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string;
  companyName?: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'On Hold';
  priority: 'High' | 'Medium' | 'Low';
  startDate: string;
  endDate?: string;
  owner: string;
  team: string; // Comma-separated list of team members
  category: 'Assessment' | 'Workshop' | 'Planning' | 'Execution' | 'Review' | 'Enablement';
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

export async function getProject(id: string): Promise<Project | null> {
    try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Project;
        } else {
            console.warn(`Project with id ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching project: ", error);
        return null;
    }
}

export async function getProjectsForCompany(companyId: string): Promise<Project[]> {
    try {
        const q = query(projectsCollection, where("companyId", "==", companyId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Project);
    } catch (error) {
        console.error("Error fetching projects for company:", error);
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
