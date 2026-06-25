'use server';
/**
 * @fileOverview A Genkit flow that generates a structured Product Requirements Document (PRD)
 *               from a simple app concept.
 *
 * - generatePrdFromConcept - A function that handles the PRD generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
  GeneratePrdFromConceptInputSchema, 
  GeneratePrdFromConceptOutputSchema 
} from '../schemas/prd';

// Export Types only (Types are stripped during build and don't violate "use server")
export type GeneratePrdFromConceptInput = z.infer<typeof GeneratePrdFromConceptInputSchema>;
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
Your task is to generate a detailed, specific, and unambiguous Product Requirements Document (PRD) based on a provided app concept. The PRD must have five distinct sections: Overview, Tech Stack, Features, Data Model, and Phases.

CRITICAL: You MUST generate all content in the following language: {{{language}}}.

For each section, adhere to the specified content guidelines. Your response should be a JSON object that strictly adheres to the provided schema.

App Concept: {{{appConcept}}}

{{#if clarifyingAnswers}}
Clarifying Answers from the user (use these to make the PRD MORE SPECIFIC and DETAILED):
{{{clarifyingAnswers}}}

You MUST incorporate these answers into the PRD. Do not ignore them.
{{/if}}

---
Section Guidelines:

1.  Overview (~5-8 lines): Describe who the product is for (specific personas, not generic "users"), what specific problem it solves (concrete pain points), the value proposition, and target platform(s). Be specific.
2.  Tech Stack (~8-12 lines): List specific technologies with versions where relevant. Include: frontend framework, backend framework, database (with type), authentication method, payment gateway (if applicable), hosting/deployment platform, and any third-party APIs. Do NOT use vague terms like "modern technologies" — name exact tools.
3.  Features (~20-30 lines): Enumerate features categorized by module. For each feature:
    - Use numbered format: FR-001, FR-002, etc.
    - Start with "The system shall..." or "The system must..."
    - Include specific business rules (e.g., "minimum password length of 12 characters")
    - Mark each as [MVP] or [Post-MVP]
    - Be testable — a developer should be able to write a test for it
4.  Data Model (~15-20 lines): Outline main database tables with:
    - Table name
    - Key columns with data types (e.g., id (UUID, PK), email (VARCHAR(255), UNIQUE, NOT NULL))
    - Relationships (one-to-many, many-to-many) with foreign keys
    - Any indexes needed for performance
5.  Phases (~12-15 lines): Propose a phased development plan (3-5 phases). For each phase:
    - Phase name and whether it's MVP
    - Goal of the phase
    - List of feature numbers included (FR-001, etc.)
    - Estimated duration
    - Dependencies on previous phases

SPECIFICITY RULES:
- Be concrete, not generic. Instead of "handle authentication", write "authenticate via email/password and Google OAuth 2.0, passwords hashed with bcrypt cost factor 12"
- Include numbers and thresholds (timeouts, limits, pagination sizes)
- Define edge cases (what happens when things go wrong)
- Avoid vague words: "maybe", "possibly", "might", "some", "various"
- Use definitive language`,
});

// Define the Genkit flow
const generatePrdFromConceptFlow = ai.defineFlow(
  {
    name: 'generatePrdFromConceptFlow',
    inputSchema: GeneratePrdFromConceptInputSchema,
    outputSchema: GeneratePrdFromConceptOutputSchema,
  },
  async (input) => {
    try {
      console.log('Starting PRD generation for concept:', input.appConcept.substring(0, 50) + '...');
      
      const { output } = await generatePrdPrompt(input);
      
      if (!output) {
        console.error('Genkit output is empty');
        throw new Error('Failed to generate PRD output: Output was empty');
      }
      
      console.log('PRD generation successful');
      return output;
    } catch (error: any) {
      console.error('Error in generatePrdFromConceptFlow:', error);
      // Re-throw a cleaner error message for the UI
      throw new Error(`AI Architect Error: ${error.message || 'Unknown error'}`);
    }
  }
);
