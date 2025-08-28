'use client';

import { GtmReadinessOutput, GtmReadinessInput } from "@/ai/flows/gtm-readiness-flow";

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

// In-memory store for prototyping
let assessmentsStore: Assessment[] = [];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAssessmentsForCompany(companyId: string): Promise<Assessment[]> {
    await delay(100);
    return assessmentsStore.filter(a => a.companyId === companyId);
}

export async function createAssessment(assessmentData: Omit<Assessment, 'id'>): Promise<void> {
    await delay(500);
    // Check if an assessment for this company already exists to prevent duplicates from the same session
    const existingIndex = assessmentsStore.findIndex(a => a.companyId === assessmentData.companyId && a.name === assessmentData.name && a.status === 'In Progress');
    
    if (existingIndex !== -1) {
        // If an in-progress assessment exists, update it instead of creating a new one.
        assessmentsStore[existingIndex] = { ...assessmentsStore[existingIndex], ...assessmentData, id: assessmentsStore[existingIndex].id };
        return;
    }

    const newAssessment: Assessment = {
        ...assessmentData,
        id: `asmt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    assessmentsStore.push(newAssessment);
}

export async function updateAssessment(id: string, assessmentData: Partial<Assessment>): Promise<void> {
    await delay(500);
    const index = assessmentsStore.findIndex(a => a.id === id);
    if (index !== -1) {
        assessmentsStore[index] = { ...assessmentsStore[index], ...assessmentData };
    }
}

    