'use server';
/**
 * @fileOverview A Genkit flow that revises an existing Product Requirements Document (PRD)
 *               based on user feedback or instructions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GeneratePrdFromConceptOutputSchema } from '../schemas/prd';

// Input Schema for Revision (Internal only, not exported)
const RevisePrdInputSchema = z.object({
  currentPrdMarkdown: z.string().describe('The current content of the PRD in markdown format.'),
  revisionInstructions: z.string().describe('User instructions on what to change or improve.'),
});

export type RevisePrdInput = z.infer<typeof RevisePrdInputSchema>;
export type RevisePrdOutput = z.infer<typeof GeneratePrdFromConceptOutputSchema>;

export async function revisePrd(input: RevisePrdInput): Promise<RevisePrdOutput> {
  return revisePrdFlow(input);
}

const revisePrdPrompt = ai.definePrompt({
  name: 'revisePrdPrompt',
  input: { schema: RevisePrdInputSchema },
  output: { schema: GeneratePrdFromConceptOutputSchema },
  prompt: `You are an expert product manager assistant.
Your task is to REVISE an existing Product Requirements Document (PRD) based on specific instructions from the user.

Current PRD Content:
{{{currentPrdMarkdown}}}

Revision Instructions:
{{{revisionInstructions}}}

Please update the PRD while maintaining the five-section structure: Overview, Tech Stack, Features, Data Model, and Phases. 
Ensure the revised content follows the instructions strictly while keeping the professional tone of a PRD.

Output the result as a JSON object adhering to the schema.`,
});

const revisePrdFlow = ai.defineFlow(
  {
    name: 'revisePrdFlow',
    inputSchema: RevisePrdInputSchema,
    outputSchema: GeneratePrdFromConceptOutputSchema,
  },
  async (input) => {
    const { output } = await revisePrdPrompt(input);
    if (!output) {
      throw new Error('Failed to generate revised PRD.');
    }
    return output;
  }
);
