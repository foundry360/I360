
'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from '@/lib/utils';
import { getCompanies, type Company } from '@/services/company-service';
import { createAssessment, updateAssessment, type Assessment } from '@/services/assessment-service';
import { Separator } from '@/components/ui/separator';
import { createNotification } from '@/services/notification-service';
import type { GtmReadinessInput } from '@/services/assessment-service';


const GtmReadinessInputSchema = z.object({
  companyId: z.string().min(1, 'Please select a company.'),
  assessmentName: z.string().min(1, 'Please enter an assessment name.'),
  companyStage: z.string().optional(),
  employeeCount: z.string().optional(),
  industrySector: z.string().optional(),
  goToMarketStrategy: z.string().optional(),
  growthChallenges: z.string().optional(),
  departmentalAlignment: z.string().optional(),
  communicationFrequency: z.string().optional(),
  responsibilityClarity: z.string().optional(),
  crmPlatform: z.string().optional(),
  dataHygienePractices: z.string().optional(),
  techStackAssessment: z.string().optional(),
  integrationEffectiveness: z.string().optional(),
  toolAdoptionRates: z.string().optional(),
  workflowAutomation: z.string().optional(),
  leadManagementProcess: z.string().optional(),
  salesCycleEfficiency: z.string().optional(),
  forecastingProcess: z.string().optional(),
  customerJourneyMapping: z.string().optional(),
  customerFirstCulture: z.string().optional(),
  personalizationEfforts: z.string().optional(),
  customerFeedbackMechanisms: z.string().optional(),
  revenueMetricsDescription: z.string().optional(),
  annualRecurringRevenue: z.string().optional(),
  netRevenueRetention: z.string().optional(),
  revenueGrowthRate: z.string().optional(),
  acquisitionMetricsDescription: z.string().optional(),
  customerAcquisitionCost: z.string().optional(),
  winRate: z.string().optional(),
  pipelineCoverage: z.string().optional(),
  pipelineVelocity: z.string().optional(),
  retentionMetricsDescription: z.string().optional(),
  churnRate: z.string().optional(),
  customerLifetimeValue: z.string().optional(),
  netPromoterScore: z.string().optional(),
  customerSatisfaction: z.string().optional(),
  kpiReportingFrequency: z.string().optional(),
  specificPainPoints: z.string().optional(),
  challengesDescription: z.string().optional(),
  executiveSponsorship: z.string().optional(),
  organizationalChangeDescription: z.string().optional(),
  crossFunctionalInputMechanisms: z.string().optional(),
  icpLastUpdated: z.string().optional(),
  valueMessagingAlignment: z.string().optional(),
  tangibleDifferentiators: z.string().optional(),
  forecastAccuracy: z.string().optional(),
  pipelineReportingTools: z.string().optional(),
  manualReportingTime: z.string().optional(),
  budgetAllocation: z.string().optional(),
  aiAdoptionBarriers: z.string().optional(),
  businessModelTesting: z.string().optional(),
});

const formSections = [
  {
    title: 'Organizational Overview & Current GTM Motion',
    fields: [
      'companyId',
      'assessmentName',
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

type FieldName = keyof z.infer<typeof GtmReadinessInputSchema>;

const fieldConfig: Record<
  FieldName,
  {
    label: string;
    description: string;
    type: 'text' | 'select' | 'slider' | 'textarea' | 'number';
    options?: string[] | { label: string, value: string }[];
  }
> = {
  companyId: { label: 'Company', description: 'Select the company for this assessment.', type: 'select', options: [] },
  assessmentName: { label: 'Assessment Name', description: 'Give this assessment a unique name.', type: 'text' },
  companyStage: { label: 'Company Stage', description: 'What is the current stage of your company?', type: 'select', options: ['Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Growth', 'Enterprise', 'Other'] },
  employeeCount: { label: 'Employee Count', description: 'How many employees are in your company?', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  industrySector: { label: 'Industry / Sector', description: 'e.g., SaaS, Fintech, Healthtech', type: 'text' },
  goToMarketStrategy: { label: 'Go-to-Market Strategy', description: 'What is your primary GTM motion?', type: 'select', options: ['Product-led', 'Sales-led', 'Hybrid', 'Channel', 'Community-led'] },
  growthChallenges: { label: 'Primary Growth Challenges', description: 'e.g., Lead generation, conversion rates, sales cycle length', type: 'textarea' },
  departmentalAlignment: { label: 'Departmental Alignment (Sales, Marketing, CS)', description: 'On a scale of 1-5, how well-aligned are your GTM departments?', type: 'slider' },
  communicationFrequency: { label: 'Inter-department Communication Frequency', description: 'How often do Sales, Marketing, and CS teams formally meet?', type: 'text' },
  responsibilityClarity: { label: 'Clarity of Responsibility at Handoffs', description: 'On a scale of 1-5, how clear are roles at customer handoff points?', type: 'slider' },
  crmPlatform: { label: 'Primary CRM Platform', description: 'e.g., Salesforce, HubSpot, Zoho', type: 'text' },
  dataHygienePractices: { label: 'Data Hygiene Practices', description: 'Describe your current process for maintaining data quality.', type: 'textarea' },
  techStackAssessment: { label: 'Overall Tech Stack Satisfaction', description: 'On a scale of 1-5, how satisfied are you with your RevOps tech stack?', type: 'slider' },
  integrationEffectiveness: { label: 'Tech Stack Integration Effectiveness', description: 'On a scale of 1-5, how well do your tools work together?', type: 'slider' },
  toolAdoptionRates: { label: 'Key Platform Adoption Rates', description: 'On a scale of 1-5, how well are key platforms adopted by users?', type: 'slider' },
  workflowAutomation: { label: 'Current Level of Workflow Automation', description: 'e.g., data entry, lead routing, reporting', type: 'textarea' },
  leadManagementProcess: { label: 'Lead Management Process', description: 'How are leads captured, qualified, routed, and nurtured?', type: 'textarea' },
  salesCycleEfficiency: { label: 'Sales Cycle Efficiency', description: 'How do you perceive the length of your current sales cycle?', type: 'select', options: ['Too long', 'Optimal', 'Fast'] },
  forecastingProcess: { label: 'Sales Forecasting Process', description: 'e.g., Manual, CRM-based, predictive tools', type: 'text' },
  customerJourneyMapping: { label: 'Formal Customer Journey Mapping', description: 'Has the full customer journey been formally mapped?', type: 'select', options: ['Yes', 'No', 'Partially'] },
  customerFirstCulture: { label: 'Customer-First Culture', description: 'On a scale of 1-5, is a customer-first mindset embedded in the culture?', type: 'slider' },
  personalizationEfforts: { label: 'Personalization in Outreach', description: 'Describe the current level of personalization in engagement.', type: 'textarea' },
  customerFeedbackMechanisms: { label: 'Customer Feedback Mechanisms', description: 'How is feedback collected and actioned? (e.g., NPS, surveys)', type: 'textarea' },
  revenueMetricsDescription: { label: 'Overall Revenue & Growth Metrics Description', description: 'e.g., Strong ARR growth but NRR needs improvement.', type: 'textarea' },
  annualRecurringRevenue: { label: 'Annual Recurring Revenue (ARR)', description: 'Select ARR range', type: 'select', options: ['<$1M', '$1M-$5M', '$5M-$10M', '$10M-$25M', '$25M-$50M', '$50M-$100M', '$100M+'] },
  netRevenueRetention: { label: 'Net Revenue Retention (NRR) (%)', description: 'Select NRR range', type: 'select', options: ['<80%', '80-90%', '90-100%', '100-110%', '110-120%', '>120%'] },
  revenueGrowthRate: { label: 'Revenue Growth Rate (%)', description: 'Select growth rate range', type: 'select', options: ['<0%', '0-20%', '21-40%', '41-60%', '61-80%', '81-100%', '>100%'] },
  acquisitionMetricsDescription: { label: 'Overall Acquisition & Sales Metrics Description', description: 'e.g., CAC is rising, win rates are stable.', type: 'textarea' },
  customerAcquisitionCost: { label: 'Customer Acquisition Cost (CAC)', description: 'e.g., 10000', type: 'number' },
  winRate: { label: 'Win Rate (%)', description: 'Select win rate range', type: 'select', options: ['<10%', '10-20%', '21-30%', '31-40%', '41-50%', '>50%'] },
  pipelineCoverage: { label: 'Pipeline Coverage Ratio', description: 'e.g., 3 (for 3x)', type: 'number' },
  pipelineVelocity: { label: 'Pipeline Velocity', description: 'Select pipeline velocity', type: 'select', options: ['Slowing', 'Stable', 'Accelerating'] },
  retentionMetricsDescription: { label: 'Overall Retention & Success Metrics Description', description: 'e.g., Churn is a concern, CLV is healthy.', type: 'textarea' },
  churnRate: { label: 'Churn Rate (%)', description: 'Select churn rate range', type: 'select', options: ['<1%', '1-2%', '2-3%', '3-5%', '>5%'] },
  customerLifetimeValue: { label: 'Customer Lifetime Value (CLV)', description: 'e.g., 50000', type: 'number' },
  netPromoterScore: { label: 'Net Promoter Score (NPS)', description: 'Select NPS score range', type: 'select', options: ['<0', '0-20', '21-40', '41-60', '61-80', '>80'] },
  customerSatisfaction: { label: 'Customer Satisfaction Score (CSAT) (%)', description: 'Select CSAT range', type: 'select', options: ['<70%', '70-80%', '81-90%', '>90%'] },
  kpiReportingFrequency: { label: 'KPI Tracking & Reporting Frequency', description: 'e.g., Weekly team dashboards, monthly executive summary.', type: 'text' },
  specificPainPoints: { label: 'Most "Broken" or Inefficient Areas in Revenue Operations', description: 'In your own words, describe where your company feels the most pain or inefficiency', type: 'textarea' },
  challengesDescription: { label: 'Biggest GTM Challenges', description: 'Briefly describe the one or two biggest challenges you face.', type: 'textarea' },
  executiveSponsorship: { label: 'Executive Sponsorship for RevOps', description: 'On a scale of 1-5, what is the level of executive buy-in for RevOps initiatives?', type: 'slider' },
  organizationalChangeDescription: { label: 'Organizational Approach to Change', description: 'How does the organization typically handle and adopt change?', type: 'textarea' },
  crossFunctionalInputMechanisms: { label: 'Cross-Functional Input Mechanisms', description: 'How is input gathered from different teams for new initiatives?', type: 'textarea' },
  icpLastUpdated: { label: 'Ideal Customer Profile (ICP) Last Updated', description: 'When was the ICP last formally updated?', type: 'text' },
  valueMessagingAlignment: { label: 'Value Proposition Consistency', description: 'On a scale of 1-5, how consistently is the value proposition communicated?', type: 'slider' },
  tangibleDifferentiators: { label: 'Tangible Differentiators', description: 'What are your clear, provable differentiators from competitors?', type: 'textarea' },
  forecastAccuracy: { label: "Accuracy of Last Quarter's Revenue Forecasts", description: "e.g., ±5% of actuals, or qualitative description", type: 'text' },
  pipelineReportingTools: { label: 'Tools Used for Pipeline Reporting & CRM Integration', description: 'What tools are used for pipeline reporting and how do they integrate with your CRM?', type: 'text' },
  manualReportingTime: { label: 'Estimated Weekly Time Spent on Manual Revenue Reporting/Forecasting', description: 'How many hours per week are spent on manual reporting and forecasting tasks?', type: 'text' },
  budgetAllocation: { label: 'Budget Allocation Perception', description: 'Describe the perception of budget allocation for RevOps tools/headcount.', type: 'textarea' },
  aiAdoptionBarriers: { label: 'Barriers to AI Adoption', description: 'e.g., cost, skills, data privacy concerns', type: 'textarea' },
  businessModelTesting: { label: 'Business Model Testing Frequency', description: 'How frequently are new pricing or packaging models tested?', type: 'text' },
};

const defaultValues = Object.entries(fieldConfig).reduce((acc, [key, value]) => {
  if (value.type === 'slider') {
    acc[key as FieldName] = '3';
  } else {
    acc[key as FieldName] = '';
  }
  return acc;
}, {} as z.infer<typeof GtmReadinessInputSchema>);


type GtmReadinessFormProps = {
  onComplete: (assessmentId?: string) => void;
  assessmentToResume?: Assessment | null;
};

export function GtmReadinessForm({ onComplete, assessmentToResume }: GtmReadinessFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [currentSection, setCurrentSection] = React.useState(0);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [currentAssessmentId, setCurrentAssessmentId] = React.useState<string | null>(null);


  const form = useForm<z.infer<typeof GtmReadinessInputSchema>>({
    resolver: zodResolver(GtmReadinessInputSchema),
    defaultValues: assessmentToResume?.formData ? 
        { ...defaultValues, ...assessmentToResume.formData } : 
        defaultValues,
    mode: 'onChange'
  });
  
  React.useEffect(() => {
    async function fetchCompanies() {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    }
    fetchCompanies();
  }, []);

  React.useEffect(() => {
    if (assessmentToResume) {
        setCurrentAssessmentId(assessmentToResume.id);
        if (assessmentToResume.formData) {
             const defaultData = { ...defaultValues, ...assessmentToResume.formData };
            // Ensure companyId from the assessment record is honored
            if (assessmentToResume.companyId) {
                defaultData.companyId = assessmentToResume.companyId;
            }
            form.reset(defaultData);
        }
        const lastCompletedSection = formSections.findLastIndex(section =>
            section.fields.every(field => !!assessmentToResume.formData?.[field as keyof GtmReadinessInput])
        );
        setCurrentSection(lastCompletedSection >= 0 ? lastCompletedSection + 1 : 0);
    }
  }, [assessmentToResume, form]);

  async function onSubmit(values: z.infer<typeof GtmReadinessInputSchema>) {
    setLoading(true);
    try {
      const { companyId, assessmentName } = values;
      const company = companies.find(c => c.id === companyId);
      const finalAssessmentName = company ? `${assessmentName} - ${company.name}` : assessmentName;
      
      const payload: Omit<Assessment, 'id' | 'result'> = {
        companyId: companyId,
        name: finalAssessmentName,
        type: 'GTM Readiness',
        status: 'Completed' as const,
        progress: 100,
        startDate: assessmentToResume?.startDate || new Date().toISOString(),
        formData: values,
      };

      let finalAssessmentId = currentAssessmentId;
      if (finalAssessmentId) {
          await updateAssessment(finalAssessmentId, payload);
      } else {
          const newId = await createAssessment(payload);
          setCurrentAssessmentId(newId);
          finalAssessmentId = newId;
      }
      
      await createNotification({
        message: `Assessment "${finalAssessmentName}" has been completed.`,
        link: `/assessment/${finalAssessmentId}/report`,
      });

      onComplete(finalAssessmentId!);
    } catch (error) {
      console.error('Error saving GTM readiness assessment:', error);
      setLoading(false);
    } 
  }

  const handleNext = async () => {
    const fields = formSections[currentSection].fields as FieldName[];
    const isValid = await form.trigger(fields);
    if (isValid) {
      if (currentSection < formSections.length - 1) {
        setCurrentSection((prev) => prev + 1);
      }
    }
  };
  
  const handleFinish = async () => {
    const fields = formSections[currentSection].fields as FieldName[];
    const isValid = await form.trigger(fields);
    if (isValid) {
      setCurrentSection((prev) => prev + 1); // Move to the final "Generate" screen
    }
  };


  const handlePrevious = () => {
    setCurrentSection((prev) => prev - 1);
  };

  const handleSaveForLater = async () => {
    const values = form.getValues();
    const { companyId, assessmentName } = values;

    if (!companyId || !assessmentName) {
        form.trigger(["companyId", "assessmentName"]);
        return;
    }

    const company = companies.find(c => c.id === companyId);
    const finalAssessmentName = company ? `${assessmentName} - ${company.name}` : assessmentName;

    const completedSections = formSections.reduce((acc, section, index) => {
        if (isSectionCompleted(index)) {
            return acc + 1;
        }
        return acc;
    }, 0);
    const progress = Math.round((completedSections / formSections.length) * 100);

    const payload: Omit<Assessment, 'id'> = {
        companyId: companyId,
        name: finalAssessmentName,
        type: 'GTM Readiness',
        status: 'In Progress' as const,
        progress: progress,
        startDate: assessmentToResume?.startDate || new Date().toISOString(),
        formData: values,
    };
    
    if (currentAssessmentId) {
        await updateAssessment(currentAssessmentId, payload);
    } else {
        const newId = await createAssessment(payload);
        setCurrentAssessmentId(newId);
    }
    onComplete();
  }
  
  const isSectionCompleted = (sectionIndex: number) => {
    if (sectionIndex < 0) return true; // Allows first section to be enabled
    if (sectionIndex >= formSections.length) return false;
    const fields = formSections[sectionIndex].fields as FieldName[];
    // For a section to be complete, all fields must have a value and be valid.
    return fields.every(field => {
      const value = form.watch(field);
      return value !== '' && value !== undefined && value !== null && !form.formState.errors[field];
    });
  }

  const companyOptions = companies.map(c => ({ label: c.name, value: c.id }));

  const isFinalStep = currentSection === formSections.length;

  return (
    <div className="grid grid-cols-12 h-full">
        <div className="col-span-3 border-r p-6 bg-muted/20">
            <h3 className="font-semibold mb-4">Assessment Sections</h3>
            <nav className="space-y-2">
                {formSections.map((section, index) => (
                    <button
                        key={section.title}
                        onClick={() => setCurrentSection(index)}
                        className={cn(
                            "w-full text-left p-2 rounded-md text-sm flex items-center gap-2",
                            currentSection === index ? "bg-background font-semibold" : "hover:bg-background/50",
                        )}
                        // Users can only navigate to sections they have completed
                        disabled={!isSectionCompleted(index-1)}
                    >
                        {isSectionCompleted(index) ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", currentSection === index ? "border-primary" : "border-muted-foreground")}>
                                {currentSection === index && <div className="h-2 w-2 rounded-full bg-primary" />}
                            </div>
                        }
                        <span>{section.title}</span>
                    </button>
                ))}
                 <button
                    key="generate-report"
                    onClick={() => setCurrentSection(formSections.length)}
                    className={cn(
                        "w-full text-left p-2 rounded-md text-sm flex items-center gap-2",
                        isFinalStep ? "bg-background font-semibold" : "hover:bg-background/50",
                    )}
                    // Users can only navigate to final step once all sections are completed
                    disabled={!isSectionCompleted(formSections.length - 1)}
                >
                    {isSectionCompleted(formSections.length - 1) ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", isFinalStep ? "border-primary" : "border-muted-foreground")}>
                            {isFinalStep && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                    }
                    <span>Submit Assessment</span>
                </button>
            </nav>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Step {isFinalStep ? formSections.length + 1 : currentSection + 1} of {formSections.length + 1}
            </p>
        </div>
        <div className="col-span-9 flex flex-col h-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                   {isFinalStep ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <Card className="max-w-lg">
                           <CardHeader>
                             <CardTitle>Submit Assessment?</CardTitle>
                           </CardHeader>
                           <CardContent>
                              <p className="text-muted-foreground mb-6">You have completed all the sections of the GTM Readiness Assessment. Click the button below to submit your answers.</p>
                               <Button type="submit" size="lg" disabled={loading} className="w-full">
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                                ) : (
                                    'Submit Assessment'
                                )}
                                </Button>
                           </CardContent>
                        </Card>
                     </div>
                   ) : (
                    <div className="flex-1 overflow-y-auto p-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {formSections[currentSection].title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Section {currentSection + 1} of {formSections.length}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {formSections[currentSection].fields.map((fieldName) => {
                                    const key = fieldName as FieldName;
                                    const config = fieldConfig[key];
                                    if (!config) return null;
                                    
                                    const options = key === 'companyId' ? companyOptions : config.options;

                                    return (
                                    <FormField
                                        key={key}
                                        control={form.control}
                                        name={key}
                                        render={({ field }) => (
                                        <FormItem>
                                            <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                <FormLabel className="cursor-help">{config.label}</FormLabel>
                                                </TooltipTrigger>
                                                <TooltipContent><p>{config.description}</p></TooltipContent>
                                            </Tooltip>
                                            </TooltipProvider>
                                            <FormControl>
                                            {config.type === 'select' ? (
                                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={key === 'companyId' && !!assessmentToResume}>
                                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                                <SelectContent>
                                                    {options?.map((option) => {
                                                        const value = typeof option === 'string' ? option : option.value;
                                                        const label = typeof option === 'string' ? option : option.label;
                                                        return <SelectItem key={value} value={value}>{label}</SelectItem>
                                                    })}
                                                </SelectContent>
                                                </Select>
                                            ) : config.type === 'slider' ? (
                                                <div className="flex items-center gap-4 pt-2">
                                                <Slider min={1} max={5} step={1} defaultValue={[Number(field.value) || 3]} onValueChange={(value) => field.onChange(String(value[0]))} />
                                                <span className="text-sm font-medium w-4">{field.value}</span>
                                                </div>
                                            ) : config.type === 'textarea' ? (
                                                <Textarea placeholder={config.description} {...field} />
                                            ) : (
                                                <Input placeholder={config.description} {...field} type={config.type} />
                                            )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    );
                                })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                   )}
                    <div className="flex justify-between items-center p-6 border-t bg-card">
                        <div>
                             <Button type="button" variant="link" onClick={handleSaveForLater}>
                                Save for Later
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentSection === 0}>
                                Previous
                            </Button>
                            {!isFinalStep && (
                                <>
                                {currentSection < formSections.length - 1 ? (
                                    <Button type="button" onClick={handleNext}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleFinish}>
                                        Finish
                                    </Button>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    </div>
  );
}
