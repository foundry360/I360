
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

const FindingSchema = z.object({
  findingTitle: z.string().describe("Descriptive title for the finding."),
  impactLevel: z.enum(['High', 'Medium', 'Low']).describe("The assessed impact level of the finding."),
  businessImpact: z.string().describe("Specific quantified effects on revenue, operations, or efficiency."),
  currentState: z.string().describe("Relevant metrics and performance indicators that describe the current state."),
  rootCauseAnalysis: z.string().describe("Underlying issues driving the problem."),
  stakeholderImpact: z.string().describe("Which teams or roles are most affected by this finding."),
  urgencyRating: z.string().describe("Recommended timeline for addressing the issue."),
});

const RecommendationSchema = z.object({
  specificActions: z.string().describe("Step-by-step implementation plan for the recommendation."),
  resourceRequirements: z.string().describe("People, technology, and budget needed."),
  expectedOutcomes: z.string().describe("Measurable success criteria and expected results."),
  riskMitigation: z.string().describe("Potential risks and strategies to mitigate them."),
  initiativeDescription: z.string().optional().describe("Business case for the initiative (for Tiers 2 and 3)."),
  dependencies: z.string().optional().describe("Dependencies on other recommendations (for Tiers 2 and 3)."),
  pilotProgram: z.string().optional().describe("Pilot program specifications and success metrics (for Tiers 2 and 3)."),
  scalabilityConsiderations: z.string().optional().describe("How the recommendation will scale (for Tiers 2 and 3)."),
  visionAndAlignment: z.string().optional().describe("Long-term vision and strategic alignment (for Tier 3)."),
  technologyRoadmap: z.string().optional().describe("Technology roadmap and capability building (for Tier 3)."),
  organizationalChange: z.string().optional().describe("Organizational change requirements (for Tier 3)."),
  marketTiming: z.string().optional().describe("Market timing and competitive considerations (for Tier 3)."),
});


const GtmReadinessOutputSchema = z.object({
  executiveSummary: z.object({
    overallReadinessScore: z.number().describe("The overall readiness score as a percentage."),
    companyStageAndFte: z.string().describe("e.g., 'Growth Stage, 51-200 FTEs'"),
    industrySector: z.string(),
    primaryGtmStrategy: z.string(),
    briefOverviewOfFindings: z.string().describe("A concise summary of the key findings."),
  }),

  top3CriticalFindings: z.array(FindingSchema).max(3),
  
  strategicRecommendationSummary: z.object({
    coreRecommendationThemes: z.string().describe("High-level themes of the strategic recommendations."),
    expectedOutcomes: z.object({
      revenueImpact: z.string().describe("Bullet points on revenue impact projections."),
      efficiencyImprovements: z.string().describe("Bullet points on efficiency gains."),
      costReductions: z.string().describe("Bullet points on potential cost savings."),
      processOptimizations: z.string().describe("Bullet points on process improvements."),
    }),
    roiExpectationsAndTimeline: z.string().describe("Expected ROI and timeline for achieving it."),
  }),

  implementationTimelineOverview: z.object({
    immediateFocus: z.string().describe("0-30 Days: Quick wins and immediate focus areas."),
    shortTermOptimizations: z.string().describe("30-90 Days: Short-term optimization initiatives."),
    longTermStrategicChanges: z.string().describe("90+ Days: Long-term strategic changes and transformation."),
  }),
  
  currentStateAssessment: z.object({
    readinessScoreBreakdown: z.object({
      overall: z.object({ score: z.number(), details: z.string() }),
      technologyAdoption: z.object({ score: z.number(), details: z.string() }),
      processMaturity: z.object({ score: z.number(), details: z.string() }),
      dataManagement: z.object({ score: z.number(), details: z.string() }),
    }),
    teamCapabilityReadiness: z.object({
      skillGapAnalysis: z.string(),
      changeManagementReadiness: z.string(),
    }),
    gtmExecutionReadiness: z.object({
      marketTimingAndCompetitivePosition: z.string(),
    }),
  }),
  
  performanceBenchmarking: z.object({
    currentMetrics: z.object({
      arr: z.string().optional(),
      nrr: z.string().optional(),
      growthRate: z.string().optional(),
      cac: z.string().optional(),
      clv: z.string().optional(),
      winRate: z.string().optional(),
      churnRate: z.string().optional(),
      nps: z.string().optional(),
      csat: z.string().optional(),
      salesCycleEfficiency: z.string().optional(),
      pipelineCoverage: z.string().optional(),
      revenueForecastAccuracy: z.string().optional(),
    }),
    comparisonAnalysis: z.string().describe("Industry benchmarking and performance gap identification."),
  }),
  
  keyFindingsAndOpportunities: z.object({
    highImpactPainPoints: z.array(FindingSchema).describe("Ranked list of severe pain points."),
    strategicOpportunities: z.array(z.object({
      marketOpportunity: z.string(),
      competitiveAdvantage: z.string(),
      resourceRequirements: z.string(),
      successProbabilityAndRisk: z.string(),
    })).describe("Key strategic opportunities identified."),
  }),

  prioritizedRecommendations: z.object({
    tier1: z.array(RecommendationSchema).describe("Critical/Immediate recommendations (0-60 days)."),
    tier2: z.array(RecommendationSchema).describe("Strategic/Short-term recommendations (60-180 days)."),
    tier3: z.array(RecommendationSchema).describe("Transformational/Long-term recommendations (6-18 months)."),
  }),

  implementationRoadmap: z.object({
    quickWins: z.object({ day30: z.string(), day60: z.string(), day90: z.string() }),
    sixMonthMilestones: z.string(),
    twelveMonthVision: z.string(),
    successMetricsDashboard: z.string().describe("KPIs to track with frequency."),
    accountabilityFramework: z.string().describe("Role assignments for functional areas."),
  }),

  investmentAndRoiAnalysis: z.object({
    totalInvestmentRequired: z.object({
      technology: z.string(),
      humanResources: z.string(),
      programBudget: z.string(),
    }),
    expectedReturns: z.object({
      revenueGrowth: z.string(),
      efficiencyGains: z.string(),
      costSavings: z.string(),
      improvedDecisionMaking: z.string(),
    }),
    paybackTimeline: z.string(),
    riskAdjustedProjections: z.string().describe("Conservative, Expected, and Optimistic scenarios."),
  }),

  nextStepsAndDecisionFramework: z.object({
    immediateActions: z.string(),
    keyDecisionsRequired: z.string(),
    successFactors: z.string(),
    reviewAndAdjustmentProcess: z.string(),
  }),
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

**Report Generation Instructions:**
Based on your analysis of the data, generate a report that follows the exact JSON schema provided. Ensure every field is populated with insightful, data-driven, and quantified analysis. Use professional, executive-level business language.

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

    