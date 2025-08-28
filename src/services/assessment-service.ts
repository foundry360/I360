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
    const newAssessment: Assessment = {
        ...assessmentData,
        id: `asmt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    assessmentsStore.push(newAssessment);
}
