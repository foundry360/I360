
'use client';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, addDoc, writeBatch, deleteDoc, query, where, getDoc, updateDoc } from 'firebase/firestore';
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
  ownerAvatarUrl?: string;
  team: string; // Comma-separated list of team members
  category: 'Assessment' | 'Workshop' | 'Planning' | 'Execution' | 'Review' | 'Enablement';
  lastActivity?: string;
  isStarred?: boolean;
}

const projectsCollection = collection(db, 'projects');

export async function updateProjectLastActivity(projectId: string): Promise<void> {
    const projectRef = doc(db, 'projects', projectId);
    try {
        await updateDoc(projectRef, {
            lastActivity: new Date().toISOString()
        });
    } catch (error) {
        // This can happen if the project is deleted before the update goes through
        console.warn(`Could not update last activity for project ${projectId}:`, error);
    }
}

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
            const project = docSnap.data() as Project;
             if (project.companyId) {
                const companyDoc = await getDoc(doc(db, 'companies', project.companyId));
                if (companyDoc.exists()) {
                    project.companyName = companyDoc.data().name;
                }
            }
            return project;
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
  const projectDocRef = doc(collection(db, 'projects'));
  const companyDoc = await getDoc(doc(db, 'companies', projectData.companyId));
  if (!companyDoc.exists()) {
    throw new Error('Company not found');
  }
  const companyName = companyDoc.data().name;
  const prefix = `${companyName.substring(0, 4).toUpperCase()}-`;
  
  const newProject = { 
      ...projectData,
      name: projectData.name.startsWith(prefix) ? projectData.name : `${prefix}${projectData.name}`,
      id: projectDocRef.id, 
      lastActivity: new Date().toISOString(),
      isStarred: false,
  };
  await setDoc(projectDocRef, newProject);
  return projectDocRef.id;
}

export async function updateProject(id: string, projectData: Partial<Omit<Project, 'id' | 'companyName'>>): Promise<void> {
    const docRef = doc(db, 'projects', id);
    const dataWithTimestamp = { ...projectData, lastActivity: new Date().toISOString() };
    await updateDoc(docRef, dataWithTimestamp);
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
