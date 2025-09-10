
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Assessment, GtmReadinessInput } from '@/services/assessment-service';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const formSections = [
  {
    title: 'Organizational Overview & Current GTM Motion',
    fields: [
      'companyStage',
      'employeeCount',
      'industrySector',
      'goToMarketStrategy',
      'growthChallenges',
    ],
  },
  {
    title: 'Strategic Alignment & Collaboration',
    fields: [
      'departmentalAlignment',
      'communicationFrequency',
      'responsibilityClarity',
    ],
  },
  {
    title: 'Data Management & Technology Stack',
    fields: [
      'crmPlatform',
      'dataHygienePractices',
      'techStackAssessment',
      'integrationEffectiveness',
      'toolAdoptionRates',
    ],
  },
  {
    title: 'Process Optimization & Automation',
    fields: [
      'workflowAutomation',
      'leadManagementProcess',
      'salesCycleEfficiency',
      'forecastingProcess',
    ],
  },
  {
    title: 'Customer Experience (CX) & Personalization',
    fields: [
      'customerJourneyMapping',
      'customerFirstCulture',
      'personalizationEfforts',
      'customerFeedbackMechanisms',
    ],
  },
  {
    title: 'Key Performance Indicators (KPIs) & Metrics',
    fields: [
        'revenueMetricsDescription',
        'annualRecurringRevenue',
        'netRevenueRetention',
        'revenueGrowthRate',
        'acquisitionMetricsDescription',
        'customerAcquisitionCost',
        'winRate',
        'pipelineCoverage',
        'pipelineVelocity',
        'retentionMetricsDescription',
        'churnRate',
        'customerLifetimeValue',
        'netPromoterScore',
        'customerSatisfaction',
        'kpiReportingFrequency',
    ],
  },
   {
    title: 'Specific Pain Points (Qualitative Feedback)',
    fields: ['specificPainPoints'],
  },
  {
    title: 'Change Management Readiness',
    fields: [
      'executiveSponsorship',
      'organizationalChangeDescription',
      'crossFunctionalInputMechanisms',
    ],
  },
    {
    title: 'Strategic Clarity & Value Proposition Validation',
    fields: [
      'challengesDescription',
      'icpLastUpdated',
      'valueMessagingAlignment',
      'tangibleDifferentiators',
    ],
  },
  {
    title: 'Forecasting & Measurement Effectiveness',
    fields: [
      'forecastAccuracy',
      'pipelineReportingTools',
      'manualReportingTime',
      'budgetAllocation',
    ],
  },
  {
    title: 'Innovation & Digital Transformation Potential',
    fields: ['aiAdoptionBarriers', 'businessModelTesting'],
  },
];


const fieldLabels: Record<keyof GtmReadinessInput, string> = {
    companyStage: 'Company Stage',
    employeeCount: 'Employee Count',
    industrySector: 'Industry / Sector',
    goToMarketStrategy: 'Go-to-Market Strategy',
    growthChallenges: 'Primary Growth Challenges',
    departmentalAlignment: 'Departmental Alignment',
    communicationFrequency: 'Communication Frequency',
    responsibilityClarity: 'Clarity of Responsibility',
    crmPlatform: 'CRM Platform',
    dataHygienePractices: 'Data Hygiene Practices',
    techStackAssessment: 'Tech Stack Satisfaction',
    integrationEffectiveness: 'Integration Effectiveness',
    toolAdoptionRates: 'Tool Adoption Rates',
    workflowAutomation: 'Workflow Automation',
    leadManagementProcess: 'Lead Management Process',
    salesCycleEfficiency: 'Sales Cycle Efficiency',
    forecastingProcess: 'Forecasting Process',
    customerJourneyMapping: 'Customer Journey Mapping',
    customerFirstCulture: 'Customer-First Culture',
    personalizationEfforts: 'Personalization Efforts',
    customerFeedbackMechanisms: 'Customer Feedback Mechanisms',
    revenueMetricsDescription: 'Revenue Metrics Description',
    annualRecurringRevenue: 'Annual Recurring Revenue (ARR)',
    netRevenueRetention: 'Net Revenue Retention (NRR)',
    revenueGrowthRate: 'Revenue Growth Rate',
    acquisitionMetricsDescription: 'Acquisition Metrics Description',
    customerAcquisitionCost: 'Customer Acquisition Cost (CAC)',
    winRate: 'Win Rate',
    pipelineCoverage: 'Pipeline Coverage',
    pipelineVelocity: 'Pipeline Velocity',
    retentionMetricsDescription: 'Retention & Success Metrics Description',
    churnRate: 'Churn Rate',
    customerLifetimeValue: 'Customer Lifetime Value (CLV)',
    netPromoterScore: 'Net Promoter Score (NPS)',
    customerSatisfaction: 'Customer Satisfaction Score (CSAT)',
    kpiReportingFrequency: 'KPI Reporting Frequency',
    specificPainPoints: 'Specific Pain Points',
    challengesDescription: 'Biggest GTM Challenges',
    executiveSponsorship: 'Executive Sponsorship',
    organizationalChangeDescription: 'Organizational Approach to Change',
    crossFunctionalInputMechanisms: 'Cross-functional Input Mechanisms',
    icpLastUpdated: 'ICP Last Updated',
    valueMessagingAlignment: 'Value Proposition Consistency',
    tangibleDifferentiators: 'Tangible Differentiators',
    forecastAccuracy: 'Forecast Accuracy',
    pipelineReportingTools: 'Pipeline Reporting Tools',
    manualReportingTime: 'Manual Reporting Time',
    budgetAllocation: 'Budget Allocation Perception',
    aiAdoptionBarriers: 'AI Adoption Barriers',
    businessModelTesting: 'Business Model Testing Frequency'
};

interface AssessmentInputsPanelProps {
    assessment: Assessment;
}

const FieldDisplay = ({ label, value }: { label: string; value: React.ReactNode }) => {
    if (!value || value.toString().trim() === '') return null;
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base">{value.toString()}</p>
        </div>
    );
};

export function AssessmentInputsPanel({ assessment }: AssessmentInputsPanelProps) {
    if (!assessment || !assessment.formData) {
        return (
            <div className="p-6">
                <p>Assessment data not found or is incomplete.</p>
            </div>
        );
    }
    
    const { formData } = assessment;

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <SheetTitle>{assessment.name}</SheetTitle>
                        <SheetDescription>GTM Readiness Assessment Inputs</SheetDescription>
                    </div>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" />
                        Export to PDF
                    </Button>
                </div>
            </SheetHeader>
            <Separator />
            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {formSections.map((section, index) => {
                        const sectionHasValues = section.fields.some(key => {
                            const value = formData[key as keyof GtmReadinessInput];
                            return value && value.toString().trim() !== '';
                        });

                        if (!sectionHasValues) return null;

                        return (
                            <div key={index} className="space-y-4">
                                <h3 className="text-lg font-semibold text-primary">{section.title}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {section.fields.map((key) => {
                                        const fieldKey = key as keyof GtmReadinessInput;
                                        const label = fieldLabels[fieldKey];
                                        const value = formData[fieldKey];
                                        return <FieldDisplay key={key} label={label} value={value} />;
                                    })}
                                </div>
                                {index < formSections.length - 1 && <Separator className="pt-4" />}
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
