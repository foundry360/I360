
'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  generateGtmReadiness,
  type GtmReadinessInput,
} from '@/ai/flows/gtm-readiness-flow';
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
  CardDescription,
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
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { createAssessment, type Assessment } from '@/services/assessment-service';
import { useRouter }from 'next/navigation';

const GtmReadinessInputSchema = z.object({
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
  integrationEffectiveness: zstring().optional(),
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
  assessmentName: { label: 'Your Name / Assessment Title', description: 'Please provide your name or a title for this assessment.', type: 'text' },
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

type PublicGtmFormProps = {
  companyId: string;
  companyName: string;
};

export function PublicGtmForm({ companyId, companyName }: PublicGtmFormProps) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof GtmReadinessInputSchema>>({
    resolver: zodResolver(GtmReadinessInputSchema),
    defaultValues: {
      ...Object.entries(fieldConfig).reduce((acc, [key, value]) => {
        acc[key as FieldName] = value.type === 'slider' ? '3' : '';
        return acc;
      }, {} as any)
    },
    mode: 'onChange'
  });

  async function onSubmit(values: z.infer<typeof GtmReadinessInputSchema>) {
    setLoading(true);
    try {
      const { assessmentName, ...assessmentData } = values;
      
      const finalAssessmentName = `${assessmentName} - ${companyName}`;
      
      // We only create the assessment shell. The analysis will be run later.
      const payload: Omit<Assessment, 'id'> = {
        companyId: companyId,
        name: finalAssessmentName,
        type: 'GTM Readiness',
        status: 'Not Started',
        progress: 0,
        startDate: new Date().toISOString(),
        formData: values,
      };

      await createAssessment(payload);

      router.push('/public/assessment/thanks');

    } catch (error) {
      console.error('Error submitting assessment:', error);
      setLoading(false);
      // Optionally, show an error toast to the user
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>GTM Readiness Assessment for {companyName}</CardTitle>
        <CardDescription>
            Please complete the form below to the best of your ability. Your responses will be used to generate a detailed Go-To-Market readiness report. This should take approximately 10-15 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
                {Object.entries(fieldConfig).map(([key, config]) => (
                    <FormField
                        key={key}
                        control={form.control}
                        name={key as FieldName}
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
                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>
                                    {config.options?.map((option) => {
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
                ))}
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
              ) : (
                'Submit Assessment'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
