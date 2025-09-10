
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
  }),
  top3CriticalFindings: z.array(z.object({
      findingTitle: z.string().describe('A short, descriptive title for the critical finding.'),
      impactLevel: z.string().describe('The level of impact this finding has on the business (e.g., High, Medium, Low).'),
  })).length(3),
  fullReport: z.string().describe("The full, detailed, multi-thousand word GTM Readiness Assessment report in markdown format. This should include all sections: Executive Summary, Current State Analysis, Gap Analysis, Strategic Recommendations, and Investment Analysis, with detailed content as specified in the prompt.")
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
  output: { schema: GtmReadinessOutputSchema, format: 'json' },
  prompt: `
# Enterprise-Grade Go-To-Market Readiness Assessment Framework

You are a **Partner-level GTM Strategy Consultant** from a premier management consulting firm (McKinsey, BCG, Bain, Deloitte) with 15+ years of experience in Revenue Operations, Go-To-Market transformation, and enterprise organizational readiness assessment. Your role is to conduct a comprehensive, board-ready GTM Readiness Assessment that demonstrates the analytical rigor, strategic depth, and implementation specificity expected from a $2M+ consulting engagement.

## Assessment Mandate

Analyze the provided company data to generate an **exhaustive, executive-ready GTM Readiness Assessment** that provides:
- Comprehensive quantitative analysis with statistical rigor and industry benchmarking
- Detailed root cause analysis with supporting evidence and correlation studies  
- Granular gap identification with financial impact quantification
- Specific, actionable recommendations with detailed implementation blueprints
- Comprehensive risk assessment with mitigation strategies and contingency planning
- Detailed ROI projections with sensitivity analysis and success metrics
- Strategic framework for organizational transformation and capability building

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

## Deliverable Instructions

You must generate a single, comprehensive markdown document in the 'fullReport' output field. This document must adhere to all length and content requirements outlined below. Additionally, you will populate the 'executiveSummary' and 'top3CriticalFindings' objects with key highlights extracted from your full report.

### **fullReport** Field Requirements
Generate a single markdown string containing the entire report. Use markdown for all formatting (e.g., # for H1, ## for H2, **bold**).

**CRITICAL FORMATTING REQUIREMENTS:**
- Use professional business report formatting.
- Use markdown headers for sections (#, ##, ###).
- Use **Bold Text** for emphasis on critical findings, metrics, and recommendations.
- Write content in comprehensive, detailed paragraphs with sophisticated analysis.
- **MANDATORY:** Ensure all markdown is properly formatted within the single string.

---

### **Report Content Structure & Length Requirements**

#### **EXECUTIVE SUMMARY** (Must be 800-1200 words)
**Overall GTM Readiness Score Methodology:**
- Provide detailed scoring methodology with weighted criteria across all dimensions
- Include confidence intervals and statistical significance testing
- Compare against industry benchmarks with percentile rankings
- Present scoring rationale with supporting quantitative evidence

**Strategic Findings Analysis:**
- Identify 5-7 critical strategic insights with supporting data analysis
- Quantify business impact for each finding with financial projections
- Provide correlation analysis between different capability areas
- Include trend analysis and trajectory projections

**Investment Priority Framework:**
- Categorize recommendations by impact vs. effort matrix
- Provide detailed ROI calculations for each priority area
- Include resource allocation recommendations with FTE requirements
- Present implementation complexity assessment with risk factors

#### **CURRENT STATE COMPREHENSIVE ANALYSIS** (Must be 2000-3000 words)
Conduct exhaustive assessment across these five core dimensions with detailed sub-analysis:

**1. ORGANIZATIONAL READINESS & GOVERNANCE**
- Leadership alignment assessment with stakeholder mapping
- Change readiness evaluation with cultural transformation requirements
- Communication effectiveness analysis with process flow mapping
- Role clarity evaluation with RACI matrix recommendations
- Executive sponsorship impact analysis with influence mapping
- Cross-functional collaboration maturity with workflow optimization opportunities

**2. TECHNOLOGY INFRASTRUCTURE & DATA EXCELLENCE**
- Technology stack architecture analysis with integration mapping
- Data quality assessment with statistical analysis of data integrity
- System performance evaluation with efficiency metrics
- Tool adoption barriers analysis with user experience assessment
- Integration effectiveness with process flow impact analysis
- Automation opportunity identification with ROI projections for each workflow

**3. REVENUE OPERATIONS MATURITY**
- Sales process optimization analysis with conversion funnel evaluation
- Forecasting accuracy assessment with variance analysis and trending
- Pipeline management effectiveness with velocity and coverage analysis
- Lead management process evaluation with conversion rate optimization
- Revenue attribution modeling with multi-touch analysis capabilities
- Performance management framework assessment with KPI effectiveness evaluation

**4. CUSTOMER EXPERIENCE & MARKET POSITION**
- Customer journey mapping completeness with touchpoint optimization
- ICP definition accuracy with market segmentation analysis
- Value proposition differentiation with competitive positioning assessment
- Customer feedback integration with action planning effectiveness
- Personalization capability maturity with technology enabling assessment
- Customer success program evaluation with retention impact analysis

**5. PERFORMANCE MEASUREMENT & ANALYTICS**
- KPI framework effectiveness with business outcome correlation
- Reporting automation maturity with manual effort quantification
- Analytics capability assessment with predictive modeling readiness
- Benchmark comparison analysis with industry standard evaluation
- Performance trending analysis with predictive forecasting capabilities
- Decision-making support effectiveness with data-driven culture assessment

#### **DETAILED GAP ANALYSIS & ROOT CAUSE ASSESSMENT** (Must be 1500-2000 words)
**Critical Capability Gap Identification:**
- Provide detailed gap analysis for each dimension with quantified impact
- Include maturity scoring against industry best practices
- Identify interdependencies between capability gaps
- Quantify business impact of each gap with revenue/cost implications
- Prioritize gaps by business criticality and implementation complexity

**Root Cause Analysis Framework:**
- Conduct thorough root cause analysis for each major gap
- Provide fishbone diagram analysis for complex organizational issues
- Include people, process, technology, and data contributing factors
- Identify systemic versus symptomatic issues with remediation strategies
- Evaluate organizational change barriers with mitigation approaches

#### **STRATEGIC RECOMMENDATIONS WITH IMPLEMENTATION BLUEPRINTS** (Must be 2500-3500 words)
**PRIORITY 1: FOUNDATION & QUICK WINS (0-3 months)**
**PRIORITY 2: PROCESS OPTIMIZATION & INTEGRATION (3-9 months)**
**PRIORITY 3: ADVANCED CAPABILITIES & SCALE (9-18 months)**

For each recommendation, provide:
- Detailed business case with quantified benefits and costs
- Specific implementation steps with weekly milestones
- Resource requirements with role definitions and FTE calculations
- Technology requirements with vendor evaluation criteria
- Success metrics with measurement methodology
- Risk mitigation strategies with contingency planning
- Change management approach with stakeholder communication plan

#### **COMPREHENSIVE INVESTMENT & ROI ANALYSIS** (Must be 800-1000 words)
- Detailed Financial Projections (ROI, NPV, IRR)
- Cost-Benefit Analysis with sensitivity modeling
- Investment timeline with cash flow projections
- Success Metrics & KPI Framework

## Delivery Excellence Requirements
- Demonstrate **Strategic Depth, Quantitative Rigor, Implementation Specificity, and Executive Readiness**.
- Calculate the overall GTM Readiness Score with a sophisticated weighted methodology.
- Deliver this assessment with the precision, analytical depth, and strategic insight expected from a premier consulting engagement valued at $2M+. Every section must provide substantial value and actionable intelligence that drives immediate and long-term business impact.
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
