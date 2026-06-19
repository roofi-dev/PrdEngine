'use server';
/**
 * @fileOverview A Genkit flow that generates a structured Product Requirements Document (PRD)
 *               from a simple app concept.
 *
 * - generatePrdFromConcept - A function that handles the PRD generation process.
 * - GeneratePrdFromConceptInput - The input type for the generatePrdFromConcept function.
 * - GeneratePrdFromConceptOutput - The return type for the generatePrdFromConcept function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GeneratePrdFromConceptInputSchema = z.object({
  appConcept: z.string().describe('A simple description of the application concept.'),
});
export type GeneratePrdFromConceptInput = z.infer<typeof GeneratePrdFromConceptInputSchema>;

// Output Schema
const GeneratePrdFromConceptOutputSchema = z.object({
  overview: z.string().describe('A brief overview of the product, including target users, problem solved, and value proposition. (~3 lines)'),
  techStack: z.string().describe('Details about the technology stack (frameworks, database, payment, hosting). (~5 lines)'),
  features: z.string().describe('A list of features per module, with MVP features marked. (~15 lines)'),
  dataModel: z.string().describe('Description of the main data tables, key columns, and relationships. (~10 lines)'),
  phases: z.string().describe('A phased development plan (e.g., Phase 1-4). (~8 lines)'),
});
export type GeneratePrdFromConceptOutput = z.infer<typeof GeneratePrdFromConceptOutputSchema>;

// Wrapper function to call the flow
export async function generatePrdFromConcept(input: GeneratePrdFromConceptInput): Promise<GeneratePrdFromConceptOutput> {
  return generatePrdFromConceptFlow(input);
}

// Define the prompt
const generatePrdPrompt = ai.definePrompt({
  name: 'generatePrdPrompt',
  input: { schema: GeneratePrdFromConceptInputSchema },
  output: { schema: GeneratePrdFromConceptOutputSchema },
  prompt: `You are an expert product manager assistant.
Your task is to generate a structured Product Requirements Document (PRD) based on a provided app concept. The PRD must have five distinct sections: Overview, Tech Stack, Features, Data Model, and Phases.

For each section, adhere to the specified content guidelines and estimated length. Your response should be a JSON object that strictly adheres to the provided schema.

App Concept: {{{appConcept}}}

---
Section Guidelines:

1.  Overview: Describe who the product is for, what problem it solves, and its value proposition. (~3 lines)
2.  Tech Stack: List the primary technologies (frameworks, database, payment gateways, hosting) that would typically be used for such an application. (~5 lines)
3.  Features: Enumerate key features, categorizing them by module if applicable. Identify at least one feature as Minimum Viable Product (MVP). (~15 lines)
4.  Data Model: Outline the main database tables, their key columns, and their relationships. (~10 lines)
5.  Phases: Propose a phased development plan, typically broken down into 4 phases (e.g., Phase 1: Planning & Design, Phase 2: Core Development, Phase 3: Testing & Deployment, Phase 4: Post-Launch & Iteration). (~8 lines)`,
});

// Define the Genkit flow
const generatePrdFromConceptFlow = ai.defineFlow(
  {
    name: 'generatePrdFromConceptFlow',
    inputSchema: GeneratePrdFromConceptInputSchema,
    outputSchema: GeneratePrdFromConceptOutputSchema,
  },
  async (input) => {
    const { output } = await generatePrdPrompt(input);
    if (!output) {
      throw new Error('Failed to generate PRD output.');
    }
    return output;
  }
);
