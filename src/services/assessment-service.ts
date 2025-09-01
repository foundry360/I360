
'use client';

import { GtmReadinessOutput, GtmReadinessInput } from "@/ai/flows/gtm-readiness-flow";
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, writeBatch, getDoc, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Company } from "./company-service";


export interface Assessment {
  id: string;
  companyId: string;
  name: string;
  type: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  startDate: string;
  result?: GtmReadinessOutput;
  formData?: Partial<GtmReadinessInput>;
  companyName?: string;
  documentUrl?: string;
}

const assessmentsCollection = collection(db, 'assessments');

export async function getAssessments(): Promise<Assessment[]> {
  try {
    const companySnapshot = await getDocs(collection(db, 'companies'));
    const companyMap = new Map(companySnapshot.docs.map(doc => [doc.id, (doc.data() as Company).name]));

    const assessmentSnapshot = await getDocs(assessmentsCollection);
    
    const assessments = assessmentSnapshot.docs.map(docSnapshot => {
        const assessment = { id: docSnapshot.id, ...docSnapshot.data() } as Assessment;
        if (assessment.companyId) {
            assessment.companyName = companyMap.get(assessment.companyId) || 'Unknown Company';
        } else {
            assessment.companyName = 'Unknown Company';
        }
        return assessment;
    });

    return assessments;
  } catch (error) {
      console.error("Error fetching assessments:", error);
      return [];
  }
}

export async function getAssessmentsForCompany(companyId: string): Promise<Assessment[]> {
    const companyDocRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyDocRef);
    const companyName = companyDoc.exists() ? (companyDoc.data() as Company).name : 'Unknown Company';
    
    const q = query(assessmentsCollection, where("companyId", "==", companyId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        companyName, 
    } as Assessment));
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

export async function uploadAssessmentDocument(assessmentId: string, file: File): Promise<string> {
    if (!auth.currentUser) {
        throw new Error("User must be logged in to upload documents.");
    }
    const storage = getStorage();
    const storageRef = ref(storage, `assessments/${assessmentId}/${file.name}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const assessmentDocRef = doc(db, 'assessments', assessmentId);
    await updateDoc(assessmentDocRef, {
        documentUrl: downloadURL
    });

    return downloadURL;
}
