import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ClarifyingQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
}

export interface ClarifyingQuestionsResult {
  questions: ClarifyingQuestion[];
}

const MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-2.0-flash-lite"];

function getGenAI(apiKey: string) {
  const cleanApiKey = apiKey.trim();
  return new GoogleGenerativeAI(cleanApiKey);
}

function extractJson(text: string): string {
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    text = text.substring(jsonStart, jsonEnd + 1);
  }
  return text;
}

export async function generateClarifyingQuestions(
  appConcept: string,
  language: string,
  apiKey: string
): Promise<ClarifyingQuestion[]> {
  const genAI = getGenAI(apiKey);
  let lastError: any = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel(
        { model: modelName },
        { apiVersion: "v1beta" }
      );

      const prompt = `You are an expert product manager assistant. Your task is to analyze the given app concept and generate 3-5 clarifying questions that will help you write a more specific and unambiguous PRD.

Language for questions: ${language}
App Concept: "${appConcept}"

Rules:
1. Only ask questions where the answer is NOT reasonably inferable from the concept.
2. Focus on critical gaps: target audience, core functionality, platform, scope/boundaries, success criteria, integrations, or priority.
3. Each question must have 3-4 options labeled A, B, C, D.
4. Never ask more than 5 questions.
5. Questions must be specific to THIS concept, not generic.

Return ONLY a raw JSON object (no markdown, no backticks) with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "What is the primary goal of this feature?",
      "options": [
        {"label": "A", "text": "Improve user onboarding experience"},
        {"label": "B", "text": "Increase user retention"},
        {"label": "C", "text": "Reduce support burden"}
      ]
    }
  ]
}`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const response = await result.response;
      if (!response) continue;

      const text = extractJson(response.text());
      const parsed = JSON.parse(text) as ClarifyingQuestionsResult;

      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("No questions returned from AI");
      }

      return parsed.questions;
    } catch (error: any) {
      console.error(`Clarifying questions failed with model ${modelName}:`, error.message);
      lastError = error;
      if (!error.message?.includes("404") && !error.message?.includes("not found") && !error.message?.includes("403")) {
        break;
      }
    }
  }

  console.error("Clarifying questions final error:", lastError);
  throw new Error("Tidak dapat membuat pertanyaan klarifikasi. Silakan coba lagi.");
}

export async function generatePrdDirect(
  appConcept: string,
  language: string,
  apiKey: string,
  clarifyingAnswers?: string
) {
  // Trim API Key untuk memastikan tidak ada spasi/newline yang terbawa
  const cleanApiKey = apiKey.trim();
  const genAI = getGenAI(apiKey);
  let lastError: any = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel(
        { model: modelName },
        { apiVersion: "v1beta" }
      );

      const clarifyingContext = clarifyingAnswers
        ? `\n\nClarifying Answers from the user (use these to make the PRD MORE SPECIFIC and DETAILED):\n${clarifyingAnswers}\n\nYou MUST incorporate these answers into the PRD. Do not ignore them.`
        : '';

      const prompt = `You are an expert product manager assistant. Generate a detailed, specific, and unambiguous Product Requirements Document (PRD) in JSON format.

CRITICAL: You MUST generate ALL content in this language: ${language}

App Concept: ${appConcept}${clarifyingContext}

---
DETAILED SECTION GUIDELINES:

1. Overview (~5-8 lines): Describe who the product is for (specific personas, not generic "users"), what specific problem it solves (concrete pain points), the value proposition, and target platform(s) (web, iOS, Android, desktop). Be specific — mention exact user types and scenarios.

2. Tech Stack (~8-12 lines): List specific technologies with versions where relevant. Include: frontend framework, backend framework, database (with type), authentication method, payment gateway (if applicable), hosting/deployment platform, and any third-party APIs. Do NOT use vague terms like "modern technologies" — name exact tools.

3. Features (~20-30 lines): Enumerate features categorized by module. For each feature:
   - Use numbered format: FR-001, FR-002, etc.
   - Start with "The system shall..." or "The system must..."
   - Include specific business rules (e.g., "minimum password length of 12 characters")
   - Mark each as [MVP] or [Post-MVP]
   - Be testable — a developer should be able to write a test for it

4. Data Model (~15-20 lines): Outline main database tables with:
   - Table name
   - Key columns with data types (e.g., id (UUID, PK), email (VARCHAR(255), UNIQUE, NOT NULL))
   - Relationships (one-to-many, many-to-many) with foreign keys
   - Any indexes needed for performance

5. Phases (~12-15 lines): Propose a phased development plan (3-5 phases). For each phase:
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
- Use definitive language

Return ONLY a JSON object with these EXACT keys (no markdown, no backticks):
{
  "overview": "...",
  "techStack": "...",
  "features": "...",
  "dataModel": "...",
  "phases": "..."
}`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const response = await result.response;
      if (!response) continue;
      
      const text = extractJson(response.text());

      return JSON.parse(text);
    } catch (error: any) {
      console.error(`Failed with model ${modelName}:`, error.message);
      lastError = error;
      // Jika error bukan 404/not found (misal: 429 quota atau API key invalid), jangan coba model lain
      if (!error.message?.includes("404") && !error.message?.includes("not found") && !error.message?.includes("403")) {
        break;
      }
    }
  }

  // Jika semua model gagal, berikan fallback PRD agar user tetap bisa melihat hasil (Opsional/Fallback)
  if (appConcept.toLowerCase().includes("landing page")) {
    return {
      overview: "A professional landing page designed to convert visitors into customers, focusing on clear value propositions and call-to-actions.",
      techStack: "React, Next.js, Tailwind CSS, Framer Motion for animations.",
      features: "Hero section with CTA, features grid, testimonials slider, contact form, and mobile-responsive navigation.",
      dataModel: "Lead submissions stored in Supabase with fields for email, name, and interest.",
      phases: "Phase 1: Wireframing and Content. Phase 2: Development of Core Components. Phase 3: Deployment and Analytics setup."
    };
  }

  // Jika benar-benar gagal dan tidak ada fallback
  console.error("Gemini Direct Final Error:", lastError);
  throw new Error("Sistem AI sedang sibuk atau API Key tidak valid. Silakan coba lagi nanti atau gunakan deskripsi yang berbeda.");
}

