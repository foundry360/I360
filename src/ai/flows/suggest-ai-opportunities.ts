'use server';

/**
 * @fileOverview AI-driven opportunity identifier for RevOps processes.
 *
 * - suggestAIOpportunities - Analyzes RevOps maturity and suggests AI/automation opportunities.
 * - SuggestAIOpportunitiesInput - Input type for the suggestAIOpportunities function.
 * - SuggestAIOpportunitiesOutput - Return type for the suggestAIOpportunities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAIOpportunitiesInputSchema = z.object({
  maturityLevel: z
    .string()
    .describe('The current RevOps maturity level of the organization.'),
  challenges: z.string().describe('A description of the RevOps challenges faced by the organization.'),
});
export type SuggestAIOpportunitiesInput = z.infer<typeof SuggestAIOpportunitiesInputSchema>;

const SuggestAIOpportunitiesOutputSchema = z.object({
  opportunities: z
    .string()
    .describe('A prioritized list of AI and automation opportunities for RevOps.'),
});
export type SuggestAIOpportunitiesOutput = z.infer<typeof SuggestAIOpportunitiesOutputSchema>;

export async function suggestAIOpportunities(input: SuggestAIOpportunitiesInput): Promise<SuggestAIOpportunitiesOutput> {
  return suggestAIOpportunitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAIOpportunitiesPrompt',
  input: {schema: SuggestAIOpportunitiesInputSchema},
  output: {schema: SuggestAIOpportunitiesOutputSchema},
  prompt: `You are an expert in Revenue Operations and AI automation.

Based on the organization's current maturity level: {{{maturityLevel}}} and the challenges they are facing: {{{challenges}}}, identify specific opportunities to leverage AI and automation tools to improve their RevOps processes. Provide a prioritized, numbered list of actionable next steps, highlighting the expected impact for each recommendation.

Focus on AI and automation tools.
`,
});

const suggestAIOpportunitiesFlow = ai.defineFlow(
  {
    name: 'suggestAIOpportunitiesFlow',
    inputSchema: SuggestAIOpportunitiesInputSchema,
    outputSchema: SuggestAIOpportunitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
