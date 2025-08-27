import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-ai-opportunities.ts';
import '@/ai/flows/analyze-revops-maturity.ts';
import '@/ai/flows/generate-executive-summary.ts';
import '@/ai/flows/generate-actionable-recommendations.ts';