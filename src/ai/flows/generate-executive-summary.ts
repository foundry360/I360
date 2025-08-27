'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an executive summary of a RevOps and GTM state.
 *
 * - generateExecutiveSummary - A function that triggers the executive summary generation flow.
 * - GenerateExecutiveSummaryInput - The input type for the generateExecutiveSummary function.
 * - GenerateExecutiveSummaryOutput - The return type for the generateExecutiveSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExecutiveSummaryInputSchema = z.object({
  gtmStrategy: z.string().describe('The go-to-market strategy.'),
  alignment: z.string().describe('The alignment between sales and marketing.'),
  techStack: z.string().describe('The technology stack used for RevOps.'),
  kpis: z.string().describe('The key performance indicators being tracked.'),
  maturityStage: z.string().describe('The RevOps maturity stage (Foundational, Developing, Aligned, Scaled, Advanced).'),
  readinessScore: z.number().describe('The calculated readiness score.'),
});
export type GenerateExecutiveSummaryInput = z.infer<typeof GenerateExecutiveSummaryInputSchema>;

const GenerateExecutiveSummaryOutputSchema = z.object({
  executiveSummary: z.string().describe('The generated executive summary of the RevOps and GTM state.'),
});
export type GenerateExecutiveSummaryOutput = z.infer<typeof GenerateExecutiveSummaryOutputSchema>;

export async function generateExecutiveSummary(input: GenerateExecutiveSummaryInput): Promise<GenerateExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: GenerateExecutiveSummaryInputSchema},
  output: {schema: GenerateExecutiveSummaryOutputSchema},
  prompt: `You are an expert in Revenue Operations (RevOps) and Go-To-Market (GTM) strategies. Based on the following information, generate a concise executive summary that provides an overview of the current RevOps and GTM state.

Go-To-Market Strategy: {{{gtmStrategy}}}
Sales and Marketing Alignment: {{{alignment}}}
Technology Stack: {{{techStack}}}
Key Performance Indicators: {{{kpis}}}
Maturity Stage: {{{maturityStage}}}
Readiness Score: {{{readinessScore}}}

Focus on highlighting the key strengths, weaknesses, and opportunities for improvement. The summary should be easily understandable for stakeholders with varying levels of familiarity with RevOps. Limit the summary to 3-4 sentences.
`,
});

const generateExecutiveSummaryFlow = ai.defineFlow(
  {
    name: 'generateExecutiveSummaryFlow',
    inputSchema: GenerateExecutiveSummaryInputSchema,
    outputSchema: GenerateExecutiveSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
