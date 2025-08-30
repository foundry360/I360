
'use client';

import { GtmReadinessOutput, GtmReadinessInput } from "@/ai/flows/gtm-readiness-flow";
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, writeBatch, getDoc, addDoc } from 'firebase/firestore';
import type { Company } from "./company-service";


export interface Assessment {
  id: string;
  companyId: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  startDate: string;
  result?: GtmReadinessOutput;
  formData?: Partial<GtmReadinessInput>;
  companyName?: string;
}

const assessmentsCollection = collection(db, 'assessments');

export async function getAssessments(): Promise<Assessment[]> {
  const snapshot = await getDocs(assessmentsCollection);
  const assessments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Assessment));

  for (const assessment of assessments) {
    if (assessment.companyId) {
      const companyDoc = await getDoc(doc(db, 'companies', assessment.companyId));
      if (companyDoc.exists()) {
        assessment.companyName = (companyDoc.data() as Company).name;
      }
    }
  }
  return assessments;
}

export async function getAssessmentsForCompany(companyId: string): Promise<Assessment[]> {
    const q = query(assessmentsCollection, where("companyId", "==", companyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
}

export async function createAssessment(assessmentData: Omit<Assessment, 'id'>): Promise<string> {
    const docRef = await addDoc(assessmentsCollection, assessmentData);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
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

    