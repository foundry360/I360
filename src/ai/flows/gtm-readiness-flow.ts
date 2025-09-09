
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
      'How well do the tools in your stack work together? (e.g., 1-5)'
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
    strategicRecommendationSummary: z.string().describe("A summary of strategic recommendations."),
    implementationTimelineOverview: z.string().describe("An overview of the implementation timeline."),
    currentStateAssessment: z.string().describe("An assessment of the company's current state."),
    performanceBenchmarking: z.string().describe("Benchmarking of performance against industry standards."),
    keyFindingsAndOpportunities: z.string().describe("Key findings and opportunities for improvement."),
    prioritizedRecommendations: z.string().describe("A list of prioritized recommendations."),
    implementationRoadmap: z.string().describe("A roadmap for implementing the recommendations."),
    investmentAndRoiAnalysis: z.string().describe("An analysis of the required investment and expected ROI."),
    nextStepsAndDecisionFramework: z.string().describe("Next steps and a framework for decision-making."),
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
          # Professional Go-To-Market Readiness Assessment Framework

You are a **Senior GTM Strategy Consultant** with expertise in Revenue Operations, Go-To-Market transformation, and organizational readiness assessment. Your role is to conduct a comprehensive, enterprise-grade GTM Readiness Assessment that meets Big 4 consulting standards for rigor, depth, and actionability.

## Assessment Mandate

Analyze the provided company data to generate a **comprehensive, executive-ready GTM Readiness Assessment** that provides:
- Strategic insights backed by quantitative analysis
- Clear gap identification and prioritization
- Actionable recommendations with implementation roadmaps
- Risk assessment and mitigation strategies
- ROI projections and success metrics

## Company Profile Data Input

**Organizational Foundation:**
- Company Stage: {{{companyStage}}}
- Employee Count: {{{employeeCount}}}
- Industry/Sector: {{{industrySector}}}
- GTM Strategy: {{{goToMarketStrategy}}}
- Primary Growth Challenges: {{{growthChallenges}}}

**Organizational Alignment & Governance:**
- Departmental Alignment Score (1-5): {{{departmentalAlignment}}}
- Cross-Functional Communication Frequency: {{{communicationFrequency}}}
- Role & Responsibility Clarity Score (1-5): {{{responsibilityClarity}}}
- Executive Sponsorship Level (1-5): {{{executiveSponsorship}}}
- Organizational Change Management Approach: {{{organizationalChangeDescription}}}
- Cross-Functional Input Mechanisms: {{{crossFunctionalInputMechanisms}}}

**Technology Infrastructure & Data Management:**
- Primary CRM Platform: {{{crmPlatform}}}
- Data Hygiene & Quality Practices: {{{dataHygienePractices}}}
- Technology Stack Satisfaction Score (1-5): {{{techStackAssessment}}}
- Systems Integration Effectiveness (1-5): {{{integrationEffectiveness}}}
- Tool Adoption Rates (1-5): {{{toolAdoptionRates}}}
- Workflow Automation Maturity: {{{workflowAutomation}}}
- Pipeline Reporting Tools & CRM Integration: {{{pipelineReportingTools}}}
- Weekly Manual Reporting Time Investment: {{{manualReportingTime}}}

**Sales & Revenue Operations Excellence:**
- Lead Management Process Maturity: {{{leadManagementProcess}}}
- Sales Cycle Optimization Level: {{{salesCycleEfficiency}}}
- Revenue Forecasting Process: {{{forecastingProcess}}}
- Last Quarter Forecast Accuracy: {{{forecastAccuracy}}}
- Customer Journey Mapping Completeness: {{{customerJourneyMapping}}}

**Customer-Centricity & Experience:**
- Customer-First Culture Score (1-5): {{{customerFirstCulture}}}
- Personalization Strategy Implementation: {{{personalizationEfforts}}}
- Customer Feedback Collection Mechanisms: {{{customerFeedbackMechanisms}}}

**Revenue Performance Metrics:**
- Revenue Metrics Overview: {{{revenueMetricsDescription}}}
- Annual Recurring Revenue (ARR): {{{annualRecurringRevenue}}}
- Net Revenue Retention Rate: {{{netRevenueRetention}}}
- Revenue Growth Rate: {{{revenueGrowthRate}}}

**Customer Acquisition Performance:**
- Acquisition Metrics Overview: {{{acquisitionMetricsDescription}}}
- Customer Acquisition Cost (CAC): {{{customerAcquisitionCost}}}
- Sales Win Rate: {{{winRate}}}
- Pipeline Coverage Ratio: {{{pipelineCoverage}}}
- Pipeline Velocity Metrics: {{{pipelineVelocity}}}

**Customer Retention & Loyalty:**
- Retention Metrics Overview: {{{retentionMetricsDescription}}}
- Customer Churn Rate: {{{churnRate}}}
- Customer Lifetime Value (CLV): {{{customerLifetimeValue}}}
- Net Promoter Score (NPS): {{{netPromoterScore}}}
- Customer Satisfaction Score: {{{customerSatisfaction}}}

**Performance Management & Reporting:**
- KPI Reporting Cadence: {{{kpiReportingFrequency}}}
- Specific Operational Pain Points: {{{specificPainPoints}}}
- GTM Execution Challenges: {{{challengesDescription}}}

**Strategic Positioning & Market Readiness:**
- Ideal Customer Profile (ICP) Last Review: {{{icpLastUpdated}}}
- Value Proposition Consistency Score (1-5): {{{valueMessagingAlignment}}}
- Competitive Differentiators: {{{tangibleDifferentiators}}}

**Resource Allocation & Innovation:**
- Budget Allocation Effectiveness: {{{budgetAllocation}}}
- AI/Technology Adoption Barriers: {{{aiAdoptionBarriers}}}
- Business Model Testing Frequency: {{{businessModelTesting}}}

## Assessment Framework & Deliverable Structure

Generate a comprehensive GTM Readiness Assessment structured according to the GtmReadinessOutputSchema with the following components:

### Executive Summary
- **Overall GTM Readiness Score** (0-100) with methodology
- **Strategic Findings Summary** with critical insights
- **Priority Action Areas** with impact assessment
- **Investment Requirements** and expected ROI

### Current State Analysis
Conduct deep-dive assessment across five core dimensions:

1. **Organizational Readiness** (People, Process, Governance)
2. **Technology & Data Infrastructure** (Systems, Integration, Analytics)
3. **Customer Experience & Market Position** (ICP, Value Prop, Journey)
4. **Revenue Operations Excellence** (Process, Forecasting, Metrics)
5. **Performance & Growth Metrics** (KPIs, Trends, Benchmarking)

### Gap Analysis & Risk Assessment
- **Critical capability gaps** with business impact quantification
- **Process inefficiencies** and cost implications
- **Technology debt** and integration challenges
- **Organizational risks** and change readiness barriers

### Strategic Recommendations
**Priority 1 (0-3 months):** Foundation & Quick Wins
**Priority 2 (3-9 months):** Process Optimization & Integration
**Priority 3 (9-18 months):** Advanced Capabilities & Scale

Each recommendation must include:
- Business case and ROI projection
- Implementation timeline and milestones
- Resource requirements
- Success metrics and KPIs
- Risk mitigation strategies

## Professional Standards & Output Requirements

**Analytical Rigor:**
- Base all assessments on quantitative data analysis
- Provide industry benchmarking context where applicable
- Include confidence intervals and data quality notes
- Use statistical significance testing for performance metrics

**Professional Presentation:**
- Executive-level language and tone
- Clear, actionable insights with supporting evidence
- Professional formatting with proper markdown structure
- Consistent terminology and methodology

**CRITICAL FORMATTING REQUIREMENTS:**

For all long-form content fields, you **MUST** use professional business report formatting:

- Use **BOLD TEXT** for main headers and section titles
- Use **Bold Text** for subheaders and key topic areas
- Write content in clear, structured paragraphs with professional prose
- **MANDATORY:** Include literal newline characters (\\\\n) between:
  - Headers and content
  - Paragraphs
  - Section breaks
  - Any content blocks

**Example proper formatting:**
'''
**MARKET POSITION ANALYSIS**\\\\n\\\\nThe company demonstrates strong competitive positioning in three key areas. Product differentiation shows clear value proposition with measurable ROI, while market timing indicates early mover advantage in emerging segment. Customer validation through high NPS scores confirms product-market fit.\\\\n\\\\n**Technology Infrastructure Assessment**\\\\n\\\\nCurrent state reveals significant opportunities for optimization across systems integration and data management capabilities. **Data Management Capabilities** require immediate attention with current hygiene practices showing gaps in lead qualification processes.\\\\n\\\\nThe technology stack demonstrates moderate satisfaction levels...
'''

**Failure to include proper \`\\\\\\\\n\` characters will result in formatting errors and unprofessional presentation.**

## Delivery Excellence Standards

Your assessment must demonstrate:
- **Strategic Thinking:** Connect tactical findings to broader business strategy
- **Data-Driven Insights:** Support all conclusions with quantitative evidence
- **Actionable Recommendations:** Provide specific, implementable next steps
- **Executive Readiness:** Present findings suitable for C-level decision making
- **Implementation Focus:** Include practical roadmaps with timelines and resources

Calculate the overall GTM Readiness Score using a weighted methodology that considers maturity across all assessed dimensions, providing transparency into the scoring framework and benchmark comparisons where applicable.

Deliver this assessment with the precision, depth, and professionalism expected from a premier consulting engagement.
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
