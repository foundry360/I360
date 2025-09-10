
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Assessment, GtmReadinessInput } from '@/services/assessment-service';
import { AppLayout } from '@/components/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button }from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const { openAssessmentModal } = useQuickAction();
    const assessmentId = params.assessmentId as string;
    const [assessment, setAssessment] = React.useState<Assessment | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!assessmentId) return;

        const fetchAssessment = async () => {
            try {
                setLoading(true);
                const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));

                if (assessmentDoc.exists()) {
                    const assessmentData = assessmentDoc.data() as Assessment;
                    if (assessmentData.companyId) {
                        const companyDoc = await getDoc(doc(db, 'companies', assessmentData.companyId));
                        if (companyDoc.exists()) {
                           assessmentData.companyName = companyDoc.data().name;
                        }
                    }
                    setAssessment(assessmentData);
                }
            } catch (err) {
                console.error("Error fetching assessment:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssessment();
    }, [assessmentId]);
    
    const handleRerun = () => {
        if (!assessment) return;
        
        const newAssessmentData = {
            ...assessment,
            id: '', // Unset the ID to create a new document
            status: 'In Progress' as const,
            result: undefined, // Clear the old result
            formData: {
                ...assessment.formData,
                assessmentName: `${assessment.name} (Rerun)`
            }
        };
        openAssessmentModal(newAssessmentData);
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="p-6 space-y-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </AppLayout>
        );
    }
    
    if (!assessment || !assessment.formData) {
        return (
            <AppLayout>
                <div className="p-6">
                    <p>Assessment data not found or is incomplete.</p>
                     <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </AppLayout>
        );
    }

    const { formData } = assessment;

    return (
        <AppLayout>
            <div className="flex flex-col h-full">
                 <div className="flex justify-between items-center p-6">
                    <div className="flex items-center gap-4">
                        <Button onClick={() => router.back()} variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{assessment.name}</h1>
                            <p className="text-muted-foreground">GTM Readiness Assessment Inputs</p>
                        </div>
                    </div>
                    <Button onClick={handleRerun} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Rerun Assessment
                    </Button>
                </div>
                <Separator />
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {formSections.map((section, index) => {
                        const sectionHasValues = section.fields.some(key => {
                            const value = formData[key as keyof GtmReadinessInput];
                            return value && value.toString().trim() !== '';
                        });

                        if (!sectionHasValues) return null;

                        return (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle>{section.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                        {section.fields.map((key) => {
                                            const fieldKey = key as keyof GtmReadinessInput;
                                            const label = fieldLabels[fieldKey];
                                            const value = formData[fieldKey];

                                            if (!label || !value || value.toString().trim() === '') return null;

                                            return (
                                                <div key={key} className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                                                    <p className="text-base">{value.toString()}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
