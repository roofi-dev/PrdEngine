import { z } from 'genkit';

/**
 * @fileOverview Zod schemas for Product Requirements Documents.
 * These are separated from the flows to avoid Next.js "use server" export restrictions.
 */

export const GeneratePrdFromConceptInputSchema = z.object({
  appConcept: z.string().describe('A simple description of the application concept.'),
});

export const GeneratePrdFromConceptOutputSchema = z.object({
  overview: z.string().describe('A brief overview of the product, including target users, problem solved, and value proposition. (~3 lines)'),
  techStack: z.string().describe('Details about the technology stack (frameworks, database, payment, hosting). (~5 lines)'),
  features: z.string().describe('A list of features per module, with MVP features marked. (~15 lines)'),
  dataModel: z.string().describe('Description of the main data tables, key columns, and relationships. (~10 lines)'),
  phases: z.string().describe('A phased development plan (e.g., Phase 1-4). (~8 lines)'),
});
