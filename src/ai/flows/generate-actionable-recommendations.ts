'use server';
/**
 * @fileOverview AI flow to generate a prioritized list of actionable next steps based on the RevOps maturity stage and collected data.
 *
 * - generateActionableRecommendations - A function that handles the generation of actionable recommendations.
 * - GenerateActionableRecommendationsInput - The input type for the generateActionableRecommendations function.
 * - GenerateActionableRecommendationsOutput - The return type for the generateActionableRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActionableRecommendationsInputSchema = z.object({
  maturityStage: z
    .string()
    .describe('The RevOps maturity stage of the user (Foundational, Developing, Aligned, Scaled, Advanced).'),
  collectedData: z.string().describe('The collected data from the user questionnaire.'),
});
export type GenerateActionableRecommendationsInput = z.infer<typeof GenerateActionableRecommendationsInputSchema>;

const GenerateActionableRecommendationsOutputSchema = z.object({
  actionableRecommendations: z
    .string()
    .describe('A prioritized, numbered list of actionable next steps tailored to the user\'s maturity stage.'),
  strategicFocusAreas: z.string().describe('3-5 strategic focus areas for the user.'),
  aiIntegrationOpportunities: z
    .string()
    .describe('Opportunities to leverage AI and automation tools to address specific challenges.'),
  expectedImpact: z.string().describe('The expected impact for each recommendation.'),
});
export type GenerateActionableRecommendationsOutput = z.infer<typeof GenerateActionableRecommendationsOutputSchema>;

export async function generateActionableRecommendations(
  input: GenerateActionableRecommendationsInput
): Promise<GenerateActionableRecommendationsOutput> {
  return generateActionableRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActionableRecommendationsPrompt',
  input: {schema: GenerateActionableRecommendationsInputSchema},
  output: {schema: GenerateActionableRecommendationsOutputSchema},
  prompt: `You are an expert RevOps consultant. Based on the user's RevOps maturity stage and the data they provided, generate a prioritized list of actionable next steps, suggest strategic focus areas, identify AI integration opportunities, and highlight the expected impact for each recommendation.

RevOps Maturity Stage: {{{maturityStage}}}
Collected Data: {{{collectedData}}}

Prioritized Actionable Next Steps:
1.  ...

Strategic Focus Areas: ...

AI Integration Opportunities: ...

Expected Impact: ...`,
});

const generateActionableRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateActionableRecommendationsFlow',
    inputSchema: GenerateActionableRecommendationsInputSchema,
    outputSchema: GenerateActionableRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
