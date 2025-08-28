
'use client';

import { GtmReadinessOutput, GtmReadinessInput } from "@/ai/flows/gtm-readiness-flow";
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, writeBatch, deleteDoc } from 'firebase/firestore';


export interface Assessment {
  id: string;
  companyId: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  startDate: string;
  result?: GtmReadinessOutput;
  formData?: Partial<GtmReadinessInput>;
}

const assessmentsCollection = collection(db, 'assessments');

export async function getAssessmentsForCompany(companyId: string): Promise<Assessment[]> {
    const q = query(assessmentsCollection, where("companyId", "==", companyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Assessment);
}

export async function createAssessment(assessmentData: Omit<Assessment, 'id'>): Promise<string> {
    const docRef = doc(assessmentsCollection);
    const newAssessment: Assessment = {
        ...assessmentData,
        id: docRef.id,
    };
    await setDoc(docRef, newAssessment);
    return newAssessment.id;
}

export async function updateAssessment(id: string, assessmentData: Partial<Omit<Assessment, 'id'>>): Promise<void> {
    const docRef = doc(db, 'assessments', id);
    await updateDoc(docRef, assessmentData);
}

export async function deleteAssessments(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const docRef = doc(db, 'assessments', id);
      batch.delete(docRef);
    });
    await batch.commit();
}
