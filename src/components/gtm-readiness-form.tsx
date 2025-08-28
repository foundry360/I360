
'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GtmReadinessInputSchema,
  generateGtmReadiness,
  type GtmReadinessInput,
  type GtmReadinessOutput,
} from '@/ai/flows/gtm-readiness-flow';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Loader2, Lightbulb, TrendingUp, Cpu, ListChecks } from 'lucide-react';
import { Badge } from './ui/badge';

const formSections = [
  {
    title: 'Company Profile',
    fields: [
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

const fieldConfig: Record<
  keyof GtmReadinessInput,
  {
    label: string;
    description: string;
    type: 'text' | 'select' | 'slider' | 'textarea';
    options?: string[];
  }
> = {
  companyStage: {
    label: 'Company Stage',
    description: 'What is the current stage of your company?',
    type: 'select',
    options: ['Seed', 'Series A', 'Growth', 'Enterprise', 'Other'],
  },
  employeeCount: {
    label: 'Employee Count',
    description: 'How many employees are in your company?',
    type: 'select',
    options: ['1-10', '11-50', '51-200', '201-500', '500+'],
  },
  industrySector: {
    label: 'Industry / Sector',
    description: 'e.g., SaaS, Fintech, Healthtech',
    type: 'text',
  },
  goToMarketStrategy: {
    label: 'Go-to-Market Strategy',
    description: 'What is your primary GTM motion?',
    type: 'select',
    options: ['Product-led', 'Sales-led', 'Hybrid', 'Channel', 'Community-led'],
  },
  growthChallenges: {
    label: 'Primary Growth Challenges',
    description: 'e.g., Lead generation, conversion rates, sales cycle length',
    type: 'textarea',
  },
  departmentalAlignment: {
    label: 'Departmental Alignment (Sales, Marketing, CS)',
    description:
      'On a scale of 1-5, how well-aligned are your GTM departments?',
    type: 'slider',
  },
  communicationFrequency: {
    label: 'Inter-department Communication Frequency',
    description: 'How often do Sales, Marketing, and CS teams formally meet?',
    type: 'text',
  },
  responsibilityClarity: {
    label: 'Clarity of Responsibility at Handoffs',
    description:
      'On a scale of 1-5, how clear are roles at customer handoff points?',
    type: 'slider',
  },
  crmPlatform: {
    label: 'Primary CRM Platform',
    description: 'e.g., Salesforce, HubSpot, Zoho',
    type: 'text',
  },
  dataHygienePractices: {
    label: 'Data Hygiene Practices',
    description: 'Describe your current process for maintaining data quality.',
    type: 'textarea',
  },
  techStackAssessment: {
    label: 'Overall Tech Stack Satisfaction',
    description:
      'On a scale of 1-5, how satisfied are you with your RevOps tech stack?',
    type: 'slider',
  },
  integrationEffectiveness: {
    label: 'Tech Stack Integration Effectiveness',
    description:
      'On a scale of 1-5, how well do your tools work together?',
    type: 'slider',
  },
  toolAdoptionRates: {
    label: 'Key Platform Adoption Rates',
    description:
      'On a scale of 1-5, how well are key platforms adopted by users?',
    type: 'slider',
  },
  workflowAutomation: {
    label: 'Current Level of Workflow Automation',
    description: 'e.g., data entry, lead routing, reporting',
    type: 'textarea',
  },
  leadManagementProcess: {
    label: 'Lead Management Process',
    description: 'How are leads captured, qualified, routed, and nurtured?',
    type: 'textarea',
  },
  salesCycleEfficiency: {
    label: 'Sales Cycle Efficiency',
    description: 'How do you perceive the length of your current sales cycle?',
    type: 'select',
    options: ['Too long', 'Optimal', 'Fast'],
  },
  forecastingProcess: {
    label: 'Sales Forecasting Process',
    description: 'e.g., Manual, CRM-based, predictive tools',
    type: 'text',
  },
  customerJourneyMapping: {
    label: 'Formal Customer Journey Mapping',
    description: 'Has the full customer journey been formally mapped?',
    type: 'select',
    options: ['Yes', 'No', 'Partially'],
  },
  customerFirstCulture: {
    label: 'Customer-First Culture',
    description:
      'On a scale of 1-5, is a customer-first mindset embedded in the culture?',
    type: 'slider',
  },
  personalizationEfforts: {
    label: 'Personalization in Outreach',
    description: 'Describe the current level of personalization in engagement.',
    type: 'textarea',
  },
  customerFeedbackMechanisms: {
    label: 'Customer Feedback Mechanisms',
    description: 'How is feedback collected and actioned? (e.g., NPS, surveys)',
    type: 'textarea',
  },
  revenueMetrics: {
    label: 'Primary Revenue Metrics Tracked',
    description: 'e.g., ARR/MRR, Gross Margin, LTV (comma-separated)',
    type: 'textarea',
  },
  acquisitionAndSalesMetrics: {
    label: 'Primary Acquisition & Sales Metrics Tracked',
    description: 'e.g., MQLs, SQLs, Conversion Rates, CAC (comma-separated)',
    type: 'textarea',
  },
  retentionAndSuccessMetrics: {
    label: 'Primary Retention & Success Metrics Tracked',
    description: 'e.g., Churn Rate, NRR, CSAT (comma-separated)',
    type: 'textarea',
  },
  measurementAndReportingFrequency: {
    label: 'KPI Review Frequency',
    description: 'How often are these KPIs reviewed?',
    type: 'text',
  },
  challengesDescription: {
    label: 'Biggest GTM Challenges',
    description: 'Briefly describe the one or two biggest challenges you face.',
    type: 'textarea',
  },
  executiveSponsorship: {
    label: 'Executive Sponsorship for RevOps',
    description:
      'On a scale of 1-5, what is the level of executive buy-in for RevOps initiatives?',
    type: 'slider',
  },
  organizationalChangeDescription: {
    label: 'Organizational Approach to Change',
    description: 'How does the organization typically handle and adopt change?',
    type: 'textarea',
  },
  crossFunctionalInputMechanisms: {
    label: 'Cross-Functional Input Mechanisms',
    description:
      'How is input gathered from different teams for new initiatives?',
    type: 'textarea',
  },
  icpLastUpdated: {
    label: 'Ideal Customer Profile (ICP) Last Updated',
    description: 'When was the ICP last formally updated?',
    type: 'text',
  },
  valueMessagingAlignment: {
    label: 'Value Proposition Consistency',
    description:
      'On a scale of 1-5, how consistently is the value proposition communicated?',
    type: 'slider',
  },
  tangibleDifferentiators: {
    label: 'Tangible Differentiators',
    description:
      'What are your clear, provable differentiators from competitors?',
    type: 'textarea',
  },
  forecastAccuracy: {
    label: 'Historical Forecast Accuracy',
    description: 'e.g., "Consistently within 10%", "Varies by >25%"',
    type: 'text',
  },
  pipelineReportingTools: {
    label: 'Pipeline Reporting Tools',
    description: 'What tools are used for pipeline reporting?',
    type: 'text',
  },
  manualReportingTime: {
    label: 'Manual Reporting Time',
    description: 'How many hours per week are spent on manual reporting tasks?',
    type: 'text',
  },
  budgetAllocation: {
    label: 'Budget Allocation Perception',
    description:
      'Describe the perception of budget allocation for RevOps tools/headcount.',
    type: 'textarea',
  },
  aiAdoptionBarriers: {
    label: 'Barriers to AI Adoption',
    description: 'e.g., cost, skills, data privacy concerns',
    type: 'textarea',
  },
  businessModelTesting: {
    label: 'Business Model Testing Frequency',
    description: 'How frequently are new pricing or packaging models tested?',
    type: 'text',
  },
};

const defaultValues = Object.entries(fieldConfig).reduce((acc, [key, value]) => {
  if (value.type === 'slider') {
    acc[key as keyof GtmReadinessInput] = '3';
  } else {
    acc[key as keyof GtmReadinessInput] = '';
  }
  return acc;
}, {} as Partial<Record<keyof GtmReadinessInput, string>>);


export function GtmReadinessForm() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<GtmReadinessOutput | null>(null);

  const form = useForm<GtmReadinessInput>({
    resolver: zodResolver(GtmReadinessInputSchema),
    defaultValues: defaultValues,
  });

  async function onSubmit(values: GtmReadinessInput) {
    setLoading(true);
    setResult(null);
    try {
      const response = await generateGtmReadiness(values);
      setResult(response);
    } catch (error) {
      console.error('Error generating GTM readiness report:', error);
      // You should show a toast notification to the user here
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          Analyzing your data...
        </p>
        <p className="text-sm text-muted-foreground">
          This may take a moment. The AI is generating your personalized recommendations.
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              <span>Prioritized Recommendations</span>
            </CardTitle>
            <CardDescription>
              Your actionable next steps to improve GTM readiness, sorted by
              priority.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.recommendations
              .sort((a, b) => a.priority - b.priority)
              .map((rec) => (
                <div key={rec.priority} className="p-4 border rounded-lg">
                  <h4 className="font-bold text-lg">
                    {rec.priority}. {rec.title}
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    {rec.justification}
                  </p>
                  <div className="flex items-center gap-6 mt-3">
                    <Badge variant="outline">
                      Impact: {rec.estimatedImpact}
                    </Badge>
                    <Badge variant="outline">
                      Effort: {rec.estimatedEffort}
                    </Badge>
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
          <CardContent>
            <p className="text-muted-foreground">{result.strategicFocusAreas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              <span>AI & Automation Opportunities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {result.aiAutomationOpportunities}
            </p>
          </CardContent>
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

        <Button onClick={() => setResult(null)}>Start Over</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {section.fields.map((fieldName) => {
                  const key = fieldName as keyof GtmReadinessInput;
                  const config = fieldConfig[key];
                  if (!config) return null;

                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={key}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{config.label}</FormLabel>
                          <FormControl>
                            {config.type === 'select' ? (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select...`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {config.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : config.type === 'slider' ? (
                              <div className="flex items-center gap-4 pt-2">
                                <Slider
                                  min={1}
                                  max={5}
                                  step={1}
                                  defaultValue={[Number(field.value) || 3]}
                                  onValueChange={(value) => field.onChange(String(value[0]))}
                                />
                                <span className="text-sm font-medium w-4">{field.value}</span>
                              </div>
                            ) : config.type === 'textarea' ? (
                              <Textarea
                                placeholder={config.description}
                                {...field}
                              />
                            ) : (
                              <Input
                                placeholder={config.description}
                                {...field}
                              />
                            )}
                          </FormControl>
                          {config.type !== 'slider' && (
                             <FormDescription>{config.description}</FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Generate GTM Readiness Report'
          )}
        </Button>
      </form>
    </Form>
  );
}
