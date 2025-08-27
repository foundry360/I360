'use server';
/**
 * @fileOverview Analyzes RevOps data to determine maturity stage.
 *
 * - analyzeRevOpsMaturity - Analyzes RevOps data and determines maturity stage.
 * - AnalyzeRevOpsMaturityInput - The input type for the analyzeRevOpsMaturity function.
 * - AnalyzeRevOpsMaturityOutput - The return type for the analyzeRevOpsMaturity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRevOpsMaturityInputSchema = z.object({
  gtmStrategy: z.string().describe('Details about the Go-To-Market strategy.'),
  alignment: z.string().describe('Information on sales and marketing alignment.'),
  techStack: z.string().describe('Description of the technology stack used.'),
  kpis: z.string().describe('Key Performance Indicators being tracked.'),
});
export type AnalyzeRevOpsMaturityInput = z.infer<typeof AnalyzeRevOpsMaturityInputSchema>;

const AnalyzeRevOpsMaturityOutputSchema = z.object({
  maturityStage: z
    .enum(['Foundational', 'Developing', 'Aligned', 'Scaled', 'Advanced'])
    .describe('The RevOps maturity stage.'),
  readinessScore: z.number().describe('A score indicating RevOps readiness.'),
});
export type AnalyzeRevOpsMaturityOutput = z.infer<typeof AnalyzeRevOpsMaturityOutputSchema>;

export async function analyzeRevOpsMaturity(
  input: AnalyzeRevOpsMaturityInput
): Promise<AnalyzeRevOpsMaturityOutput> {
  return analyzeRevOpsMaturityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRevOpsMaturityPrompt',
  input: {schema: AnalyzeRevOpsMaturityInputSchema},
  output: {schema: AnalyzeRevOpsMaturityOutputSchema},
  prompt: `You are an expert in Revenue Operations. Analyze the following RevOps data to determine the maturity stage (Foundational, Developing, Aligned, Scaled, Advanced) and a readiness score (0-100).\n\nGo-To-Market Strategy: {{{gtmStrategy}}}\nSales and Marketing Alignment: {{{alignment}}}\nTechnology Stack: {{{techStack}}}\nKey Performance Indicators: {{{kpis}}}\n\nProvide the maturity stage and readiness score.`,
});

const analyzeRevOpsMaturityFlow = ai.defineFlow(
  {
    name: 'analyzeRevOpsMaturityFlow',
    inputSchema: AnalyzeRevOpsMaturityInputSchema,
    outputSchema: AnalyzeRevOpsMaturityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
