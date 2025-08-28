'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  generateGtmReadiness,
  type GtmReadinessInput,
  type GtmReadinessOutput,
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
import { Loader2, Lightbulb, TrendingUp, Cpu, ListChecks, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { z } from 'zod';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from '@/lib/utils';
import { getCompanies, type Company } from '@/services/company-service';
import { createAssessment } from '@/services/assessment-service';

const GtmReadinessInputSchema = z.object({
  companyId: z.string().min(1, 'Please select a company.'),
  companyStage: z.string().min(1, 'This field is required.'),
  employeeCount: z.string().min(1, 'This field is required.'),
  industrySector: z.string().min(1, 'This field is required.'),
  goToMarketStrategy: z.string().min(1, 'This field is required.'),
  growthChallenges: z.string().min(1, 'This field is required.'),
  departmentalAlignment: z.string(),
  communicationFrequency: z.string().min(1, 'This field is required.'),
  responsibilityClarity: z.string(),
  crmPlatform: z.string().min(1, 'This field is required.'),
  dataHygienePractices: z.string().min(1, 'This field is required.'),
  techStackAssessment: z.string(),
  integrationEffectiveness: z.string(),
  toolAdoptionRates: z.string(),
  workflowAutomation: z.string().min(1, 'This field is required.'),
  leadManagementProcess: z.string().min(1, 'This field is required.'),
  salesCycleEfficiency: z.string().min(1, 'This field is required.'),
  forecastingProcess: z.string().min(1, 'This field is required.'),
  customerJourneyMapping: z.string().min(1, 'This field is required.'),
  customerFirstCulture: z.string(),
  personalizationEfforts: z.string().min(1, 'This field is required.'),
  customerFeedbackMechanisms: z.string().min(1, 'This field is required.'),
  revenueMetrics: z.string().min(1, 'This field is required.'),
  acquisitionAndSalesMetrics: z.string().min(1, 'This field is required.'),
  retentionAndSuccessMetrics: z.string().min(1, 'This field is required.'),
  measurementAndReportingFrequency: z.string().min(1, 'This field is required.'),
  challengesDescription: z.string().min(1, 'This field is required.'),
  executiveSponsorship: z.string(),
  organizationalChangeDescription: z.string().min(1, 'This field is required.'),
  crossFunctionalInputMechanisms: z.string().min(1, 'This field is required.'),
  icpLastUpdated: z.string().min(1, 'This field is required.'),
  valueMessagingAlignment: z.string(),
  tangibleDifferentiators: z.string().min(1, 'This field is required.'),
  forecastAccuracy: z.string().min(1, 'This field is required.'),
  pipelineReportingTools: z.string().min(1, 'This field is required.'),
  manualReportingTime: z.string().min(1, 'This field is required.'),
  budgetAllocation: z.string().min(1, 'This field is required.'),
  aiAdoptionBarriers: z.string().min(1, 'This field is required.'),
  businessModelTesting: z.string().min(1, 'This field is required.'),
});

const formSections = [
  {
    title: 'Company Profile',
    fields: [
      'companyId',
      'companyStage',
      'employeeCount',
      'industrySector',
      'goToMarketStrategy',
      'growthChallenges',
    ],
  },
  {
    title: 'Internal Alignment',
    fields: [
      'departmentalAlignment',
      'communicationFrequency',
      'responsibilityClarity',
    ],
  },
  {
    title: 'Technology & Data',
    fields: [
      'crmPlatform',
      'dataHygienePractices',
      'techStackAssessment',
      'integrationEffectiveness',
      'toolAdoptionRates',
    ],
  },
  {
    title: 'Process & Execution',
    fields: [
      'workflowAutomation',
      'leadManagementProcess',
      'salesCycleEfficiency',
      'forecastingProcess',
    ],
  },
  {
    title: 'Customer Centricity',
    fields: [
      'customerJourneyMapping',
      'customerFirstCulture',
      'personalizationEfforts',
      'customerFeedbackMechanisms',
    ],
  },
  {
    title: 'Metrics & KPIs',
    fields: [
      'revenueMetrics',
      'acquisitionAndSalesMetrics',
      'retentionAndSuccessMetrics',
      'measurementAndReportingFrequency',
    ],
  },
  {
    title: 'Strategy & Planning',
    fields: [
      'challengesDescription',
      'executiveSponsorship',
      'organizationalChangeDescription',
      'crossFunctionalInputMechanisms',
      'icpLastUpdated',
      'valueMessagingAlignment',
      'tangibleDifferentiators',
    ],
  },
  {
    title: 'Reporting & Budget',
    fields: [
      'forecastAccuracy',
      'pipelineReportingTools',
      'manualReportingTime',
      'budgetAllocation',
    ],
  },
  {
    title: 'Future Readiness',
    fields: ['aiAdoptionBarriers', 'businessModelTesting'],
  },
];

type FieldName = keyof z.infer<typeof GtmReadinessInputSchema>;

const fieldConfig: Record<
  FieldName,
  {
    label: string;
    description: string;
    type: 'text' | 'select' | 'slider' | 'textarea';
    options?: string[] | { label: string, value: string }[];
  }
> = {
  companyId: { label: 'Company', description: 'Select the company for this assessment.', type: 'select', options: [] },
  companyStage: { label: 'Company Stage', description: 'What is the current stage of your company?', type: 'select', options: ['Seed', 'Series A', 'Growth', 'Enterprise', 'Other'] },
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
  revenueMetrics: { label: 'Primary Revenue Metrics Tracked', description: 'e.g., ARR/MRR, Gross Margin, LTV (comma-separated)', type: 'textarea' },
  acquisitionAndSalesMetrics: { label: 'Primary Acquisition & Sales Metrics Tracked', description: 'e.g., MQLs, SQLs, Conversion Rates, CAC (comma-separated)', type: 'textarea' },
  retentionAndSuccessMetrics: { label: 'Primary Retention & Success Metrics Tracked', description: 'e.g., Churn Rate, NRR, CSAT (comma-separated)', type: 'textarea' },
  measurementAndReportingFrequency: { label: 'KPI Review Frequency', description: 'How often are these KPIs reviewed?', type: 'text' },
  challengesDescription: { label: 'Biggest GTM Challenges', description: 'Briefly describe the one or two biggest challenges you face.', type: 'textarea' },
  executiveSponsorship: { label: 'Executive Sponsorship for RevOps', description: 'On a scale of 1-5, what is the level of executive buy-in for RevOps initiatives?', type: 'slider' },
  organizationalChangeDescription: { label: 'Organizational Approach to Change', description: 'How does the organization typically handle and adopt change?', type: 'textarea' },
  crossFunctionalInputMechanisms: { label: 'Cross-Functional Input Mechanisms', description: 'How is input gathered from different teams for new initiatives?', type: 'textarea' },
  icpLastUpdated: { label: 'Ideal Customer Profile (ICP) Last Updated', description: 'When was the ICP last formally updated?', type: 'text' },
  valueMessagingAlignment: { label: 'Value Proposition Consistency', description: 'On a scale of 1-5, how consistently is the value proposition communicated?', type: 'slider' },
  tangibleDifferentiators: { label: 'Tangible Differentiators', description: 'What are your clear, provable differentiators from competitors?', type: 'textarea' },
  forecastAccuracy: { label: 'Historical Forecast Accuracy', description: 'e.g., "Consistently within 10%", "Varies by >25%"', type: 'text' },
  pipelineReportingTools: { label: 'Pipeline Reporting Tools', description: 'What tools are used for pipeline reporting?', type: 'text' },
  manualReportingTime: { label: 'Manual Reporting Time', description: 'How many hours per week are spent on manual reporting tasks?', type: 'text' },
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
  onComplete: () => void;
};

export function GtmReadinessForm({ onComplete }: GtmReadinessFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<GtmReadinessOutput | null>(null);
  const [currentSection, setCurrentSection] = React.useState(0);
  const [companies, setCompanies] = React.useState<Company[]>([]);

  const form = useForm<z.infer<typeof GtmReadinessInputSchema>>({
    resolver: zodResolver(GtmReadinessInputSchema),
    defaultValues: defaultValues,
    mode: 'onChange'
  });
  
  React.useEffect(() => {
    async function fetchCompanies() {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    }
    fetchCompanies();
  }, []);

  async function onSubmit(values: z.infer<typeof GtmReadinessInputSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const { companyId, ...assessmentData } = values;
      const response = await generateGtmReadiness(assessmentData as GtmReadinessInput);
      await createAssessment({
          companyId: companyId,
          name: 'GTM Readiness',
          status: 'Completed',
          progress: 100,
          startDate: new Date().toISOString(),
          result: response,
          formData: values,
      });
      setResult(response);
    } catch (error) {
      console.error('Error generating GTM readiness report:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleNext = async () => {
    const fields = formSections[currentSection].fields as FieldName[];
    const isValid = await form.trigger(fields);
    if (isValid) {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentSection((prev) => prev - 1);
  };

  const handleSaveForLater = async () => {
    const values = form.getValues();
    const { companyId } = values;

    if (!companyId) {
        form.trigger("companyId");
        return;
    }

    const completedSections = formSections.reduce((acc, section, index) => {
        if (isSectionCompleted(index)) {
            return acc + 1;
        }
        return acc;
    }, 0);
    const progress = Math.round((completedSections / formSections.length) * 100);

    await createAssessment({
        companyId: companyId,
        name: 'GTM Readiness',
        status: 'In Progress',
        progress: progress,
        startDate: new Date().toISOString(),
        formData: values,
    });
    onComplete();
  }
  
  const isSectionCompleted = (sectionIndex: number) => {
    const fields = formSections[sectionIndex].fields as FieldName[];
    // For a section to be complete, all fields must have a value and be valid.
    return fields.every(field => {
      const value = form.watch(field);
      return value !== '' && value !== undefined && value !== null && !form.formState.errors[field];
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Analyzing your data...</p>
        <p className="text-sm text-muted-foreground">This may take a moment. The AI is generating your personalized recommendations.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              <span>Prioritized Recommendations</span>
            </CardTitle>
            <CardDescription>Your actionable next steps to improve GTM readiness, sorted by priority.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.recommendations.sort((a, b) => a.priority - b.priority).map((rec) => (
              <div key={rec.priority} className="p-4 border rounded-lg">
                <h4 className="font-bold text-lg">{rec.priority}. {rec.title}</h4>
                <p className="text-muted-foreground mt-1">{rec.justification}</p>
                <div className="flex items-center gap-6 mt-3">
                  <Badge variant="outline">Impact: {rec.estimatedImpact}</Badge>
                  <Badge variant="outline">Effort: {rec.estimatedEffort}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>Strategic Focus Areas</span>
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-muted-foreground">{result.strategicFocusAreas}</p></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              <span>AI & Automation Opportunities</span>
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-muted-foreground">{result.aiAutomationOpportunities}</p></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              <span>Key Metrics to Monitor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.keyMetricsToMonitor.split(',').map(metric => (
                <Badge key={metric.trim()} variant="secondary">{metric.trim()}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Button onClick={onComplete}>Close</Button>
      </div>
    );
  }
  
  const companyOptions = companies.map(c => ({ label: c.name, value: c.id }));

  return (
    <div className="grid grid-cols-12 h-full">
        <div className="col-span-3 border-r p-6 bg-primary-light">
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
                        disabled={index > 0 && !isSectionCompleted(index-1)}
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
            </nav>
        </div>
        <div className="col-span-9 p-6 overflow-y-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                    <div className="flex-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>{formSections[currentSection].title}</CardTitle>
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
                                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                                                <Input placeholder={config.description} {...field} />
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

                    <div className="flex justify-between items-center pt-8">
                        <div>
                             <Button type="button" variant="link" onClick={handleSaveForLater}>
                                Save for Later
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentSection === 0}>
                                Previous
                            </Button>
                            {currentSection < formSections.length - 1 ? (
                                <Button type="button" onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit" size="lg" disabled={loading}>
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                                ) : (
                                    'Generate GTM Readiness Report'
                                )}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    </div>
  );
}
