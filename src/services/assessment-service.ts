
'use client';

import { db, auth } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, writeBatch, getDoc, addDoc, deleteField } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Company } from "./company-service";
import { createNotification } from "./notification-service";

export interface GtmReadinessInput {
  companyStage?: string;
  employeeCount?: string;
  industrySector?: string;
  goToMarketStrategy?: string;
  growthChallenges?: string;
  departmentalAlignment?: string;
  communicationFrequency?: string;
  responsibilityClarity?: string;
  crmPlatform?: string;
  dataHygienePractices?: string;
  techStackAssessment?: string;
  integrationEffectiveness?: string;
  toolAdoptionRates?: string;
  workflowAutomation?: string;
  leadManagementProcess?: string;
  salesCycleEfficiency?: string;
  forecastingProcess?: string;
  customerJourneyMapping?: string;
  customerFirstCulture?: string;
  personalizationEfforts?: string;
  customerFeedbackMechanisms?: string;
  revenueMetricsDescription?: string;
  annualRecurringRevenue?: string;
  netRevenueRetention?: string;
  revenueGrowthRate?: string;
  acquisitionMetricsDescription?: string;
  customerAcquisitionCost?: string;
  winRate?: string;
  pipelineCoverage?: string;
  pipelineVelocity?: string;
  retentionMetricsDescription?: string;
  churnRate?: string;
  customerLifetimeValue?: string;
  netPromoterScore?: string;
  customerSatisfaction?: string;
  kpiReportingFrequency?: string;
  specificPainPoints?: string;
  challengesDescription?: string;
  executiveSponsorship?: string;
  organizationalChangeDescription?: string;
  crossFunctionalInputMechanisms?: string;
  icpLastUpdated?: string;
  valueMessagingAlignment?: string;
  tangibleDifferentiators?: string;
  forecastAccuracy?: string;
  pipelineReportingTools?: string;
  manualReportingTime?: string;
  budgetAllocation?: string;
  aiAdoptionBarriers?: string;
  businessModelTesting?: string;
}

export interface GtmReadinessOutput {
  executiveSummary: {
    overallReadinessScore: number;
    companyStageAndFte: string;
    industrySector: string;
    primaryGtmStrategy: string;
  };
  top3CriticalFindings: Array<{
    findingTitle: string;
    impactLevel: string;
  }>;
  fullReport: string;
}

export interface Assessment {
  id: string;
  companyId: string;
  name: string;
  type: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  startDate: string;
  result?: GtmReadinessOutput;
  formData?: Partial<GtmReadinessInput> & { companyId?: string, assessmentName?: string };
  companyName?: string;
  documentUrl?: string;
  isStarred?: boolean;
  lastActivity?: string;
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

export async function createAssessment(assessmentData: Omit<Assessment, 'id' | 'result'>, isPublicSubmission: boolean = false): Promise<string> {
    const docRef = await addDoc(assessmentsCollection, {});
    const now = new Date().toISOString();
    const finalData = { 
        ...assessmentData, 
        id: docRef.id, 
        isStarred: false,
        startDate: assessmentData.startDate || now,
        lastActivity: now,
    };
    await setDoc(docRef, finalData);

    if (isPublicSubmission) {
      const companyDoc = await getDoc(doc(db, 'companies', assessmentData.companyId));
      const companyName = companyDoc.exists() ? (companyDoc.data() as Company).name : 'the company';
      await createNotification({
        message: `A new assessment for ${companyName} has been submitted.`,
        link: `/assessment/${docRef.id}/report`,
      });
    }

    return docRef.id;
}

export async function updateAssessment(id: string, assessmentData: Partial<Omit<Assessment, 'id' | 'result'>>): Promise<void> {
    const docRef = doc(db, 'assessments', id);
    const dataWithTimestamp = {
        ...assessmentData,
        lastActivity: new Date().toISOString(),
    };
    await updateDoc(docRef, dataWithTimestamp);
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

export async function deleteAssessmentDocument(assessmentId: string): Promise<void> {
    if (!auth.currentUser) {
        throw new Error("User must be logged in to delete documents.");
    }
    const storage = getStorage();
    const assessmentDocRef = doc(db, 'assessments', assessmentId);
    const assessmentDoc = await getDoc(assessmentDocRef);

    if (assessmentDoc.exists()) {
        const assessmentData = assessmentDoc.data() as Assessment;
        const url = assessmentData.documentUrl;

        if (url) {
            try {
                // The URL needs to be decoded to get the correct path
                const decodedUrl = decodeURIComponent(url);
                const pathRegex = /o\/(.*?)\?/;
                const match = decodedUrl.match(pathRegex);

                if (match && match[1]) {
                    const filePath = match[1];
                    const fileRef = ref(storage, filePath);
                    await deleteObject(fileRef);
                } else {
                    console.warn("Could not extract file path from URL:", url);
                }
            } catch (error) {
                console.error("Error deleting file from storage:", error);
                // Don't throw if file doesn't exist, just continue to remove the URL from firestore
                if ((error as any).code !== 'storage/object-not-found') {
                    throw error;
                }
            }

            // Remove the URL field from the Firestore document
            await updateDoc(assessmentDocRef, {
                documentUrl: deleteField()
            });
        }
    } else {
        throw new Error("Assessment not found");
    }
}
