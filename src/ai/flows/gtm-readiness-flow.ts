
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
    .describe('How do you perceive the length of your current sales cycle? (e.g. Too long, Optimal, Fast)'),
  forecastingProcess: z
    .string()
    .describe('e.g., Manual, CRM-based, predictive tools'),
  customerJourneyMapping: z
    .string()
    .describe('Has the full customer journey been formally mapped? (e.g., Yes, No, Partially)'),
  customerFirstCulture: z
    .string()
    .describe(
      'Is a customer-first mindset embedded in the culture? (1-5)'
    ),
  personalizationEfforts: z
    .string()
    .describe('Current level of personalization in customer engagement.'),
  customerFeedbackMechanisms: z
    .string()
    .describe('How is feedback collected and actioned? (e.g., NPS, surveys)'),
  revenueMetricsDescription: z.string().describe('Overall Revenue & Growth Metrics Description (e.g., Strong ARR growth but NRR needs improvement.)'),
  annualRecurringRevenue: z.string().describe('Annual Recurring Revenue (ARR) range'),
  netRevenueRetention: z.string().describe('Net Revenue Retention (NRR) (%)'),
  revenueGrowthRate: z.string().describe('Revenue Growth Rate (%)'),
  acquisitionMetricsDescription: z.string().describe('Overall Acquisition & Sales Metrics Description (e.g., CAC is rising, win rates are stable.)'),
  customerAcquisitionCost: z.string().describe('Customer Acquisition Cost (CAC) (e.g., 10000)'),
  winRate: z.string().describe('Win Rate (%)'),
  pipelineCoverage: z.string().describe('Pipeline Coverage Ratio (e.g., 3 for 3x)'),
  pipelineVelocity: z.string().describe('Pipeline Velocity (e.g., Slowing, Stable, Accelerating)'),
  retentionMetricsDescription: z.string().describe('Overall Retention & Success Metrics Description (e.g., Churn is a concern, CLV is healthy.)'),
  churnRate: z.string().describe('Churn Rate (%)'),
  customerLifetimeValue: z.string().describe('Customer Lifetime Value (CLV) (e.g., 50000)'),
  netPromoterScore: z.string().describe('Net Promoter Score (NPS)'),
  customerSatisfaction: z.string().describe('Customer Satisfaction Score (CSAT) (%)'),
  kpiReportingFrequency: z
    .string()
    .describe('e.g., Weekly team dashboards, monthly executive summary.'),
  specificPainPoints: z
    .string()
    .describe(
      'Most "Broken" or Inefficient Areas in Revenue Operations'
    ),
  challengesDescription: z.string().describe('Biggest GTM Challenges'),
  executiveSponsorship: z
    .string()
    .describe('Executive sponsorship for RevOps initiatives (1-5)'),
  organizationalChangeDescription: z.string().describe('Organizational approach to change'),
  crossFunctionalInputMechanisms: z.string().describe('Cross-functional input mechanisms'),
  icpLastUpdated: z.string().describe('Ideal Customer Profile (ICP) Last Updated'),
  valueMessagingAlignment: z.string().describe('Value proposition consistency (1-5)'),
  tangibleDifferentiators: z.string().describe('Tangible differentiators from competitors'),
  forecastAccuracy: z.string().describe("Accuracy of Last Quarter's Revenue Forecasts (e.g., ±5% of actuals, or qualitative description)"),
  pipelineReportingTools: z.string().describe('Tools Used for Pipeline Reporting & CRM Integration'),
  manualReportingTime: z.string().describe('Estimated Weekly Time Spent on Manual Revenue Reporting/Forecasting'),
  budgetAllocation: z.string().describe('Budget allocation perception for RevOps'),
  aiAdoptionBarriers: z.string().describe('Barriers to AI adoption (e.g., cost, skills)'),
  businessModelTesting: z.string().describe('Business model testing frequency'),
});

export type GtmReadinessInput = z.infer<typeof GtmReadinessInputSchema>;

const GtmReadinessOutputSchema = z.object({
    executiveSummary: z.object({
        overallReadinessScore: z.number().describe('A score from 0-100 representing the overall GTM readiness.'),
        companyStageAndFte: z.string().describe('A summary of the company stage and employee count.'),
        industrySector: z.string().describe('The industry sector of the company.'),
        primaryGtmStrategy: z.string().describe('The primary GTM strategy of the company.'),
        briefOverviewOfFindings: z.string().describe('A brief, high-level overview of the key findings from the assessment.'),
    }),
    top3CriticalFindings: z.array(z.object({
        findingTitle: z.string().describe('A short, descriptive title for the critical finding.'),
        impactLevel: z.string().describe('The level of impact this finding has on the business (e.g., High, Medium, Low).'),
        businessImpact: z.string().describe('A detailed explanation of how this issue impacts the business, referencing specific metrics if possible.'),
        currentState: z.string().describe('A description of the current situation related to this finding.'),
        rootCauseAnalysis: z.string().describe('An analysis of the underlying causes of this issue.'),
        stakeholderImpact: z.string().describe('Which departments or roles are most affected by this issue.'),
        urgencyRating: z.string().describe('A rating of how urgently this finding needs to be addressed (e.g., Critical, High, Medium).'),
    })).length(3),
    strategicRecommendationSummary: z.string().describe("Content formatted with markdown."),
    implementationTimelineOverview: z.string().describe("Content formatted with markdown."),
    currentStateAssessment: z.string().describe("Content formatted with markdown."),
    performanceBenchmarking: z.string().describe("Content formatted with markdown."),
    keyFindingsAndOpportunities: z.string().describe("Content formatted with markdown."),
    prioritizedRecommendations: z.string().describe("Content formatted with markdown."),
    implementationRoadmap: z.string().describe("Content formatted with markdown."),
    investmentAndRoiAnalysis: z.string().describe("Content formatted with markdown."),
    nextStepsAndDecisionFramework: z.string().describe("Content formatted with markdown."),
});

export type GtmReadinessOutput = z.infer<typeof GtmReadinessOutputSchema>;

export async function generateGtmReadiness(
  input: GtmReadinessInput
): Promise<GtmReadinessOutput> {
  return generateGtmReadinessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gtmReadinessPrompt',
  input: { schema: GtmReadinessInputSchema },
  output: { schema: GtmReadinessOutputSchema },
  prompt: `
          You are an expert RevOps and Go-To-Market (GTM) strategist. Your task is to analyze the provided company data and generate a comprehensive GTM Readiness Assessment report.

          **User-Provided Data:**
          - Company Stage: {{{companyStage}}}
          - Employee Count: {{{employeeCount}}}
          - Industry/Sector: {{{industrySector}}}
          - GTM Strategy: {{{goToMarketStrategy}}}
          - Growth Challenges: {{{growthChallenges}}}
          - Departmental Alignment (1-5): {{{departmentalAlignment}}}
          - Communication Frequency: {{{communicationFrequency}}}
          - Responsibility Clarity (1-5): {{{responsibilityClarity}}}
          - CRM Platform: {{{crmPlatform}}}
          - Data Hygiene Practices: {{{dataHygienePractices}}}
          - Tech Stack Satisfaction (1-5): {{{techStackAssessment}}}
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
          - GTM Challenges: {{{challengesDescription}}}
          - Executive Sponsorship (1-5): {{{executiveSponsorship}}}
          - Organizational Change Approach: {{{organizationalChangeDescription}}}
          - Cross-Functional Input Mechanisms: {{{crossFunctionalInputMechanisms}}}
          - ICP Last Updated: {{{icpLastUpdated}}}
          - Value Proposition Consistency (1-5): {{{valueMessagingAlignment}}}
          - Tangible Differentiators: {{{tangibleDifferentiators}}}
          - Accuracy of Last Quarter\'s Revenue Forecasts: {{{forecastAccuracy}}}
          - Tools Used for Pipeline Reporting & CRM Integration: {{{pipelineReportingTools}}}
          - Estimated Weekly Time Spent on Manual Revenue Reporting/Forecasting: {{{manualReportingTime}}}
          - Budget Allocation Perception: {{{budgetAllocation}}}
          - AI Adoption Barriers: {{{aiAdoptionBarriers}}}
          - Business Model Testing Frequency: {{{businessModelTesting}}}
          
          **Your Task & AI Text Formatting Instructions:**

          Based on the data above, generate a detailed GTM Readiness Assessment report structured according to the GtmReadinessOutputSchema.
          
          For all long-form text fields in the output schema (e.g., 'strategicRecommendationSummary', 'currentStateAssessment', etc.), you MUST format the content using the markdown instructions below to create a readable and professional report.

          ## Required Formatting Rules:

          ### 1. Document Structure
          - Always start with a brief executive summary paragraph
          - Use two hash symbols for main section headers
          - Use three hash symbols for subsection headers within each main section
          - Separate sections with blank lines

          ### 2. Content Organization
          - Group related findings under logical section headers
          - Present information in a hierarchical structure
          - Start each section with the most critical information

          ### 3. Text Emphasis
          - Use single asterisks for *emphasis* on important concepts
          - Use backticks for \`system names\`, \`tools\`, and \`specific metrics\`
          - Use dashes for bullet points within sections
          - Bold important ratings and scores

          ### 4. Metrics and Ratings
          - Format ratings clearly: "Rated 2/5" or "Rating: 2/5"
          - Include specific numbers and percentages
          - Highlight critical performance indicators

          ### 5. Spacing and Layout
          - Add blank lines before and after each section header
          - Use consistent indentation for bullet points
          - Ensure paragraphs are separated by blank lines

          ## Example Output Format:

          \`\`\`
          The company's current state reveals significant challenges across core business functions. This analysis identifies critical gaps that require immediate attention to drive sustainable growth.

          ## Strategic Alignment

          The organization struggles with fundamental strategic clarity and execution.

          ### GTM Strategy
          - Primary approach: Product-led strategy with execution challenges
          - ICP last updated: 12 months ago, indicating potential market disconnect
          - Value proposition consistency: Rated 2/5, creating market confusion

          ### Organizational Structure  
          - Departmental alignment: Rated 2/5, showing internal silos
          - Communication effectiveness: Monthly meetings but poor outcomes
          - Executive sponsorship: Requires stronger leadership commitment

          ## Operational Efficiency

          Current operations are characterized by manual processes and system fragmentation.

          ### Technology Stack
          - CRM platform: \`Salesforce\` underutilized despite implementation
          - Integration effectiveness: Critically low at 1/5 rating
          - Automation level: Minimal, resulting in 30 hours/week manual effort
          \`\`\`
          
          **IMPORTANT**: Apply these formatting instructions ONLY to the string content of the fields in the GtmReadinessOutputSchema that are described as "Content formatted with markdown.". Do not alter the JSON structure itself. Calculate an overall readiness score based on a holistic analysis of all inputs. Be direct, professional, and use the language of a seasoned RevOps consultant.
  `,
});

const generateGtmReadinessFlow = ai.defineFlow(
  {
    name: 'generateGtmReadinessFlow',
    inputSchema: GtmReadinessInputSchema,
    outputSchema: GtmReadinessOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
