
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
  revenueMetricsDescription: z.string().describe('Overall Revenue & Growth Metrics Description (e.g., trajectory, key highlights)'),
  annualRecurringRevenue: z.string().describe('Annual Recurring Revenue (ARR) range'),
  netRevenueRetention: z.string().describe('Net Revenue Retention (NRR) (%) range'),
  revenueGrowthRate: z.string().describe('Revenue Growth Rate (%) range'),
  acquisitionMetricsDescription: z.string().describe('Overall Acquisition & Sales Metrics Description (e.g., trends, key observations)'),
  customerAcquisitionCost: z.string().describe('Customer Acquisition Cost (CAC) (Numeric Value)'),
  winRate: z.string().describe('Win Rate (%) range'),
  pipelineCoverage: z.string().describe('Pipeline Coverage Ratio (e.g., 3 means 3x)'),
  pipelineVelocity: z.string().describe('Pipeline Velocity'),
  retentionMetricsDescription: z.string().describe('Overall Retention & Success Metrics Description (e.g., trends, key observations)'),
  churnRate: z.string().describe('Churn Rate (%) range'),
  customerLifetimeValue: z.string().describe('Customer Lifetime Value (CLV) (Numeric Value)'),
  netPromoterScore: z.string().describe('Net Promoter Score (NPS) range'),
  customerSatisfaction: z.string().describe('Customer Satisfaction Score (CSAT) (%) range'),
  kpiReportingFrequency: z.string().describe('KPI Tracking & Reporting Frequency (across departments, to executives)'),
  specificPainPoints: z.string().describe('Qualitative feedback on the most "broken" or inefficient areas in revenue operations.'),
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

const FindingSchema = z.object({
  findingTitle: z.string().describe("Descriptive title for the finding."),
  impactLevel: z.enum(['High', 'Medium', 'Low']).describe("The assessed impact level of the finding."),
  businessImpact: z.string().describe("Specific quantified effects on revenue, operations, or efficiency."),
  currentState: z.string().describe("Relevant metrics and performance indicators that describe the current state."),
  rootCauseAnalysis: z.string().describe("Underlying issues driving the problem."),
  stakeholderImpact: z.string().describe("Which teams or roles are most affected by this finding."),
  urgencyRating: z.string().describe("Recommended timeline for addressing the issue."),
});

const GtmReadinessOutputSchema = z.object({
  executiveSummary: z.object({
    overallReadinessScore: z.number().describe("The overall readiness score as a percentage."),
    companyStageAndFte: z.string().describe("e.g., 'Growth Stage, 51-200 FTEs'"),
    industrySector: z.string(),
    primaryGtmStrategy: z.string(),
    briefOverviewOfFindings: z.string().describe("A concise summary of the key findings."),
  }),
  top3CriticalFindings: z.array(FindingSchema),
  strategicRecommendationSummary: z.string().describe("A formatted string covering Core Themes, Expected Outcomes, and ROI expectations."),
  implementationTimelineOverview: z.string().describe("A formatted string covering the 0-30, 30-90, and 90+ day plans."),
  currentStateAssessment: z.string().describe("A formatted string covering Readiness Scores, Team Capability, and GTM Execution Readiness."),
  performanceBenchmarking: z.string().describe("A formatted string covering Current Metrics and Comparison Analysis."),
  keyFindingsAndOpportunities: z.string().describe("A formatted string covering High-Impact Pain Points and Strategic Opportunities."),
  prioritizedRecommendations: z.string().describe("A formatted string covering Tier 1, Tier 2, and Tier 3 recommendations in detail."),
  implementationRoadmap: z.string().describe("A formatted string covering the 90-day plan, long-term milestones, success metrics, and accountability."),
  investmentAndRoiAnalysis: z.string().describe("A formatted string covering Investment, Returns, Payback timeline, and Risk-Adjusted Projections."),
  nextStepsAndDecisionFramework: z.string().describe("A formatted string covering Immediate Actions, Key Decisions, Success Factors, and Review Process."),
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
  model: 'googleai/gemini-1.5-pro',
  prompt: `You are an expert RevOps and GTM consultant. Your task is to analyze the provided company data and generate a comprehensive, executive-level GTM Readiness Assessment report. Follow the specified structure and formatting requirements meticulously.

**CRITICAL INSTRUCTION:** If the user provides very little or no information for most of the fields, you MUST generate a very low readiness score (under 20%). In the executive summary, you MUST state that the score is low because of insufficient data provided for a proper analysis. Do not invent findings or recommendations if there is no data to support them. The report should be brief and explain that a full assessment requires more data.

**Analyze the following company data:**
- Company Stage: {{{companyStage}}}
- Employee Count (FTEs): {{{employeeCount}}}
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
- Revenue Metrics Description: {{{revenueMetricsDescription}}}
- Annual Recurring Revenue: {{{annualRecurringRevenue}}}
- Net Revenue Retention: {{{netRevenueRetention}}}
- Revenue Growth Rate: {{{revenueGrowthRate}}}
- Acquisition Metrics Description: {{{acquisitionMetricsDescription}}}
- Customer Acquisition Cost: {{{customerAcquisitionCost}}}
- Win Rate: {{{winRate}}}
- Pipeline Coverage: {{{pipelineCoverage}}}
- Pipeline Velocity: {{{pipelineVelocity}}}
- Retention Metrics Description: {{{retentionMetricsDescription}}}
- Churn Rate: {{{churnRate}}}
- Customer Lifetime Value: {{{customerLifetimeValue}}}
- Net Promoter Score: {{{netPromoterScore}}}
- Customer Satisfaction: {{{customerSatisfaction}}}
- KPI Reporting Frequency: {{{kpiReportingFrequency}}}
- Specific Pain Points: {{{specificPainPoints}}}
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

**Report Generation Instructions:**
Based on your analysis of the data, generate a report that follows the exact JSON schema provided. For fields requiring a formatted string, use markdown-style headings (e.g., "### Core Themes") and bullet points (e.g., "- Item 1") to structure the content within that string. Ensure every field is populated with insightful, data-driven, and quantified analysis. Use professional, executive-level business language.

**Key areas of focus for your analysis:**
1.  **Quantification**: Wherever possible, translate qualitative data into quantitative business impact. For example, if "sales cycle is too long", estimate the potential revenue impact of shortening it.
2.  **Scoring**: Calculate readiness scores based on the 1-5 scale inputs and other relevant data. A score of 5/5 should translate to ~100%, 1/5 to ~20%, etc.
3.  **Prioritization**: The recommendations must be tiered and prioritized based on impact and urgency. The findings must also be ranked by severity.
4.  **Actionability**: Provide concrete, step-by-step implementation plans, not vague suggestions.
5.  **Holistic View**: Connect the dots between different data points. For instance, link poor data hygiene to inaccurate forecasting and inefficient personalization.

Produce the report strictly adhering to the output schema.
`,
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

    