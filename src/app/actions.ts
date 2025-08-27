'use server';

import { z } from 'zod';
import { analyzeRevOpsMaturity, type AnalyzeRevOpsMaturityOutput } from '@/ai/flows/analyze-revops-maturity';
import { generateExecutiveSummary, type GenerateExecutiveSummaryOutput } from '@/ai/flows/generate-executive-summary';
import { generateActionableRecommendations, type GenerateActionableRecommendationsOutput } from '@/ai/flows/generate-actionable-recommendations';
import { suggestAIOpportunities, type SuggestAIOpportunitiesOutput } from '@/ai/flows/suggest-ai-opportunities';

const formSchema = z.object({
  gtmStrategy: z.string().min(1),
  alignment: z.string().min(1),
  techStack: z.string().min(1),
  kpis: z.string().min(1),
  challenges: z.string().min(1),
});

export type AnalysisResult = {
  maturityAnalysis: AnalyzeRevOpsMaturityOutput;
  executiveSummary: GenerateExecutiveSummaryOutput;
  recommendations: GenerateActionableRecommendationsOutput;
  aiOpportunities: SuggestAIOpportunitiesOutput;
};

export async function getAnalysis(
  values: z.infer<typeof formSchema>
): Promise<{ data: AnalysisResult | null; error: string | null }> {
  try {
    const validatedValues = formSchema.parse(values);

    const maturityAnalysis = await analyzeRevOpsMaturity({
      gtmStrategy: validatedValues.gtmStrategy,
      alignment: validatedValues.alignment,
      techStack: validatedValues.techStack,
      kpis: validatedValues.kpis,
    });

    const [executiveSummary, recommendations, aiOpportunities] = await Promise.all([
      generateExecutiveSummary({
        ...validatedValues,
        maturityStage: maturityAnalysis.maturityStage,
        readinessScore: maturityAnalysis.readinessScore,
      }),
      generateActionableRecommendations({
        maturityStage: maturityAnalysis.maturityStage,
        collectedData: JSON.stringify(values),
      }),
      suggestAIOpportunities({
        maturityLevel: maturityAnalysis.maturityStage,
        challenges: validatedValues.challenges,
      }),
    ]);

    return {
      data: {
        maturityAnalysis,
        executiveSummary,
        recommendations,
        aiOpportunities,
      },
      error: null,
    };
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return { data: null, error: 'Invalid form data provided.' };
    }
    return { data: null, error: 'An unexpected error occurred during analysis.' };
  }
}
