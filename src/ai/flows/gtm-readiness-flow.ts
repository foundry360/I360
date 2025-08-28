'use server';
/**
 * @fileOverview A GTM Readiness assessment AI agent.
 *
 * - generateGtmReadiness - A function that handles the GTM Readiness assessment process.
 * - GtmReadinessInput - The input type for the generateGtmReadiness function.
 * - GtmReadinessOutput - The return type for the generateGtmReadiness function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GtmReadinessInputSchema = z.object({
  companyStage: z.string().describe('e.g., Seed, Series A, Growth, Enterprise'),
  employeeCount: z
    .string()
    .describe('e.g., 1-10, 11-50, 51-200, 201-500, 500+'),
  industrySector: z.string().describe('e.g., SaaS, Fintech, Healthtech'),
  goToMarketStrategy: z
    .string()
    .describe(
      'e.g., Product-led, Sales-led, Hybrid, Channel, Community-led'
    ),
  growthChallenges: z
    .string()
    .describe(
      'Primary obstacles to scaling revenue (e.g., lead generation, conversion rates, sales cycle length, churn)'
    ),
  departmentalAlignment: z
    .string()
    .describe('Perceived alignment between Sales, Marketing, and CS (1-5)'),
  communicationFrequency: z
    .string()
    .describe('How often do Sales, Marketing, and CS teams formally meet?'),
  responsibilityClarity: z
    .string()
    .describe(
      'Clarity of roles and responsibilities at handoff points (1-5)'
    ),
  crmPlatform: z.string().describe('e.g., Salesforce, HubSpot, Zoho, Pipedrive'),
  dataHygienePractices: z
    .string()
    .describe('Current process for maintaining data quality in the CRM'),
  techStackAssessment: z
    .string()
    .describe('Overall satisfaction with the current RevOps tech stack (1-5)'),
  integrationEffectiveness: z
    .string()
    .describe(
      'How well do the tools in your stack work together? (1-5)'
    ),
  toolAdoptionRates: z.string().describe('User adoption of key platforms (1-5)'),
  workflowAutomation: z
    .string()
    .describe(
      'Current level of automation for routine tasks (e.g., data entry, lead routing, reporting)'
    ),
  leadManagementProcess: z
    .string()
    .describe('How are leads captured, qualified, routed, and nurtured?'),
  salesCycleEfficiency: z
    .string()
    .describe('Perception of the current sales cycle length (Too long, Optimal, Fast)'),
  forecastingProcess: z
    .string()
    .describe('Current method for sales forecasting (e.g., manual, CRM-based, predictive tools)'),
  customerJourneyMapping: z
    .string()
    .describe('Has the full customer journey been formally mapped? (Yes/No)'),
  customerFirstCulture: z
    .string()
    .describe('Is a customer-first mindset embedded in the company culture? (1-5)'),
  personalizationEfforts: z
    .string()
    .describe('Current level of personalization in outreach and engagement'),
  customerFeedbackMechanisms: z
    .string()
    .describe('How is customer feedback systematically collected and actioned? (e.g., NPS, surveys, support tickets)'),
  revenueMetrics: z
    .string()
    .describe('Primary revenue KPIs tracked (e.g., ARR/MRR, Gross Margin, LTV)'),
  acquisitionAndSalesMetrics: z
    .string()
    .describe('Primary top-of-funnel KPIs (e.g., MQLs, SQLs, Conversion Rates, CAC)'),
  retentionAndSuccessMetrics: z
    .string()
    .describe('Primary customer success KPIs (e.g., Churn Rate, NRR, CSAT)'),
  measurementAndReportingFrequency: z
    .string()
    .describe('How often are these KPIs reviewed? (e.g., Daily, Weekly, Monthly)'),
  challengesDescription: z
    .string()
    .describe('A brief description of the biggest challenges faced.'),
  executiveSponsorship: z
    .string()
    .describe('Level of exec buy-in for RevOps initiatives (1-5)'),
  organizationalChangeDescription: z
    .string()
    .describe('How does the organization handle change?'),
  crossFunctionalInputMechanisms: z
    .string()
    .describe('How is input gathered from different teams for new initiatives?'),
  icpLastUpdated: z
    .string()
    .describe('When was the Ideal Customer Profile last formally updated?'),
  valueMessagingAlignment: z
    .string()
    .describe('How consistently is the value proposition communicated? (1-5)'),
  tangibleDifferentiators: z
    .string()
    .describe('What are the clear, provable differentiators from competitors?'),
  forecastAccuracy: z.string().describe('Historical accuracy of sales forecasts'),
  pipelineReportingTools: z
    .string()
    .describe('What tools are used for pipeline reporting?'),
  manualReportingTime: z
    .string()
    .describe('Hours per week spent on manual reporting tasks'),
  budgetAllocation: z
    .string()
    .describe('Perception of budget allocation for RevOps tools/headcount'),
  aiAdoptionBarriers: z
    .string()
    .describe('What are the biggest barriers to adopting AI? (e.g., cost, skills, data privacy)'),
  businessModelTesting: z
    .string()
    .describe('How frequently are new pricing/packaging models tested?'),
});
export type GtmReadinessInput = z.infer<typeof GtmReadinessInputSchema>;

const GtmReadinessOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      priority: z.number().describe('The priority of the recommendation (1 is highest)'),
      title: z.string().describe('A short, descriptive title for the recommendation.'),
      justification: z.string().describe('The reasoning behind why this recommendation is important, based on the provided data.'),
      estimatedImpact: z
        .enum(['High', 'Medium', 'Low'])
        .describe('The potential positive impact on revenue and efficiency.'),
      estimatedEffort: z
        .enum(['High', 'Medium', 'Low'])
        .describe('The estimated effort required to implement the recommendation.'),
    })
  ).describe('A prioritized list of actionable recommendations.'),
  strategicFocusAreas: z.string().describe('A single paragraph highlighting 3-5 key areas where focused efforts will yield the highest impact.'),
  aiAutomationOpportunities: z.string().describe('A single paragraph suggesting how AI and automation can address challenges and accelerate growth.'),
  keyMetricsToMonitor: z.string().describe('A comma-separated string of 3-5 critical KPIs to track the success of the recommendations.'),
});
export type GtmReadinessOutput = z.infer<typeof GtmReadinessOutputSchema>;

export async function generateGtmReadiness(
  input: GtmReadinessInput
): Promise<GtmReadinessOutput> {
  return gtmReadinessFlow(input);
}

const gtmReadinessPrompt = ai.definePrompt({
  name: 'gtmReadinessPrompt',
  input: { schema: GtmReadinessInputSchema },
  output: { schema: GtmReadinessOutputSchema },
  prompt: `You are an expert RevOps advisor. Your task is to analyze the provided company data for a "GTM Readiness" assessment and generate a structured set of recommendations.

Analyze the following data points to identify strengths, weaknesses, and opportunities across the company's people, processes, and technology.

Company Data:
- Company Stage: {{{companyStage}}}
- Employee Count: {{{employeeCount}}}
- Industry Sector: {{{industrySector}}}
- Go-to-Market Strategy: {{{goToMarketStrategy}}}
- Growth Challenges: {{{growthChallenges}}}
- Departmental Alignment (1-5): {{{departmentalAlignment}}}
- Communication Frequency: {{{communicationFrequency}}}
- Responsibility Clarity (1-5): {{{responsibilityClarity}}}
- CRM Platform: {{{crmPlatform}}}
- Data Hygiene Practices: {{{dataHygienePractices}}}
- Tech Stack Assessment (1-5): {{{techStackAssessment}}}
- Integration Effectiveness (1-5): {{{integrationEffectiveness}}}
- Tool Adoption Rates (1-5): {{{toolAdoptionRates}}}
- Workflow Automation: {{{workflowAutomation}}}
- Lead Management Process: {{{leadManagementProcess}}}
- Sales Cycle Efficiency: {{{salesCycleEfficiency}}}
- Forecasting Process: {{{forecastingProcess}}}
- Customer Journey Mapping: {{{customerJourneyMapping}}}
- Customer-First Culture (1-5): {{{customerFirstCulture}}}
- Personalization Efforts: {{{personalizationEfforts}}}
- Customer Feedback Mechanisms: {{{customerFeedbackMechanisms}}}
- Revenue Metrics Tracked: {{{revenueMetrics}}}
- Acquisition & Sales Metrics Tracked: {{{acquisitionAndSalesMetrics}}}
- Retention & Success Metrics Tracked: {{{retentionAndSuccessMetrics}}}
- Measurement & Reporting Frequency: {{{measurementAndReportingFrequency}}}
- Description of Challenges: {{{challengesDescription}}}
- Executive Sponsorship for RevOps (1-5): {{{executiveSponsorship}}}
- Organizational Approach to Change: {{{organizationalChangeDescription}}}
- Cross-Functional Input Mechanisms: {{{crossFunctionalInputMechanisms}}}
- ICP Last Updated: {{{icpLastUpdated}}}
- Value Messaging Alignment (1-5): {{{valueMessagingAlignment}}}
- Tangible Differentiators: {{{tangibleDifferentiators}}}
- Forecast Accuracy: {{{forecastAccuracy}}}
- Pipeline Reporting Tools: {{{pipelineReportingTools}}}
- Manual Reporting Time (hours/week): {{{manualReportingTime}}}
- Budget Allocation Perception: {{{budgetAllocation}}}
- AI Adoption Barriers: {{{aiAdoptionBarriers}}}
- Business Model Testing Frequency: {{{businessModelTesting}}}

Based on your analysis, provide the following structured output:

1.  **Recommendations**: Generate a prioritized list of actionable recommendations. Each recommendation must include a priority, title, justification, estimated impact, and estimated effort. Base your justifications directly on the data provided. For example, if 'Data Hygiene Practices' are poor, recommend implementing a data quality tool or process.
2.  **Strategic Focus Areas**: Write a single, concise paragraph highlighting the 3-5 most critical areas that require immediate attention to improve GTM readiness and drive revenue growth.
3.  **AI/Automation Opportunities**: Write a single, concise paragraph identifying specific opportunities to leverage AI and automation. Connect these suggestions to the challenges identified in the company data, such as automating manual reporting or using AI for lead scoring.
4.  **Key Metrics to Monitor**: Provide a comma-separated string of 3-5 essential KPIs that the company should track to measure the success of implementing your recommendations. These should be directly related to the identified weaknesses.`,
});

const gtmReadinessFlow = ai.defineFlow(
  {
    name: 'gtmReadinessFlow',
    inputSchema: GtmReadinessInputSchema,
    outputSchema: GtmReadinessOutputSchema,
  },
  async (input) => {
    const { output } = await gtmReadinessPrompt(input);
    return output!;
  }
);
