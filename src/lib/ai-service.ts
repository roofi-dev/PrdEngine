import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ClarifyingQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
}

export interface ClarifyingQuestionsResult {
  questions: ClarifyingQuestion[];
}

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-2.0-flash-lite"];
const GROQ_MODELS_QUESTIONS = ["gemma2-9b-it", "llama-3.1-8b-instant"];
const GROQ_MODELS_PRD = ["llama-3.3-70b-versatile", "gemma2-9b-it"];

function getGenAI(apiKey: string) {
  const cleanApiKey = apiKey.trim();
  return new GoogleGenerativeAI(cleanApiKey);
}

async function callGroq(
  apiKey: string,
  model: string,
  prompt: string,
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature ?? 0.5,
      max_tokens: options.maxTokens ?? 2048,
      top_p: 0.95,
      ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
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

function safeJsonParse<T>(text: string): T {
  const cleaned = extractJson(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    try {
      let fixed = cleaned
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      return JSON.parse(fixed) as T;
    } catch {
      let fixed = cleaned
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      fixed = fixed.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
        return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      });
      return JSON.parse(fixed) as T;
    }
  }
}

function flattenToText(val: any, indent: string = ''): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val.map((item, i) => {
      if (typeof item === 'string') return `${indent}${i + 1}. ${item}`;
      const flat = flattenToText(item, indent + '  ');
      return `${indent}${i + 1}. ${flat}`;
    }).join('\n');
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val).filter(([, v]) => v != null);
    return entries.map(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        return `${indent}${k}: ${v}`;
      }
      return `${indent}${k}:\n${flattenToText(v, indent + '  ')}`;
    }).join('\n');
  }
  return String(val);
}

function normalizePrdResponse(data: any): any {
  const fields = ['overview', 'techStack', 'features', 'dataModel', 'phases'];
  const result: Record<string, string> = {};
  for (const field of fields) {
    const val = data?.[field];
    if (val == null) {
      result[field] = '';
    } else if (typeof val === 'string') {
      result[field] = val;
    } else {
      result[field] = flattenToText(val);
    }
  }
  return result;
}

export async function generateClarifyingQuestions(
  appConcept: string,
  language: string,
  apiKey: string,
  groqApiKey?: string
): Promise<ClarifyingQuestion[]> {
  let lastError: any = null;

  const promptText = `You are an expert product manager assistant. Your task is to analyze the given app concept and generate 3-5 clarifying questions that will help you write a more specific and unambiguous PRD.

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

  // --- Try Groq first ---
  if (groqApiKey && groqApiKey.trim()) {
    for (const modelName of GROQ_MODELS_QUESTIONS) {
      try {
        const rawText = await callGroq(groqApiKey, modelName, promptText, {
          temperature: 0.5,
          maxTokens: 2048,
          jsonMode: true,
        });
        const parsed = safeJsonParse<ClarifyingQuestionsResult>(rawText);
        if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
          throw new Error("No questions returned from AI");
        }
        return parsed.questions;
      } catch (error: any) {
        console.error(`Groq clarifying questions failed with model ${modelName}:`, error.message);
        lastError = error;
        continue;
      }
    }
  }

  // --- Fallback to Gemini ---
  const genAI = getGenAI(apiKey);

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel(
        { model: modelName },
        { apiVersion: "v1beta" }
      );

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.5,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      });

      const response = await result.response;
      if (!response) continue;

      const parsed = safeJsonParse<ClarifyingQuestionsResult>(response.text());

      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("No questions returned from AI");
      }

      return parsed.questions;
    } catch (error: any) {
      console.error(`Clarifying questions failed with model ${modelName}:`, error.message);
      lastError = error;
      const msg = error.message || '';
      if (msg.includes("429") || msg.includes("503") || msg.includes("overloaded") || msg.includes("Service Unavailable") || msg.includes("quota")) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      continue;
    }
  }

  console.error("Clarifying questions final error:", lastError);
  const isQuotaError = lastError?.message?.includes("429") || lastError?.message?.includes("quota");
  throw new Error(isQuotaError
    ? "Quota API Gemini telah habis. Silakan tunggu 1 menit lalu coba lagi, atau gunakan API key lain."
    : "Tidak dapat membuat pertanyaan klarifikasi. Silakan coba lagi."
  );
}

export async function generatePrdDirect(
  appConcept: string,
  language: string,
  apiKey: string,
  clarifyingAnswers?: string,
  groqApiKey?: string
) {
  let lastError: any = null;

  const clarifyingContext = clarifyingAnswers
    ? `\n\nClarifying Answers from the user (use these to make the PRD MORE SPECIFIC and DETAILED):\n${clarifyingAnswers}\n\nYou MUST incorporate these answers into the PRD. Do not ignore them.`
    : '';

  const promptText = `You are an expert product manager assistant. Generate a detailed, specific, and unambiguous Product Requirements Document (PRD) in JSON format.

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

  // --- Try Groq first ---
  if (groqApiKey && groqApiKey.trim()) {
    for (const modelName of GROQ_MODELS_PRD) {
      try {
        const rawText = await callGroq(groqApiKey, modelName, promptText, {
          temperature: 0.7,
          maxTokens: 8192,
          jsonMode: true,
        });
        const parsed = safeJsonParse<any>(rawText);
        return normalizePrdResponse(parsed);
      } catch (error: any) {
        console.error(`Groq PRD failed with model ${modelName}:`, error.message);
        lastError = error;
        continue;
      }
    }
  }

  // --- Fallback to Gemini ---
  const genAI = getGenAI(apiKey);

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel(
        { model: modelName },
        { apiVersion: "v1beta" }
      );

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      });

      const response = await result.response;
      if (!response) continue;
      
      const parsed = safeJsonParse<any>(response.text());
      return normalizePrdResponse(parsed);
    } catch (error: any) {
      console.error(`Failed with model ${modelName}:`, error.message);
      lastError = error;
      const msg = error.message || '';
      if (msg.includes("429") || msg.includes("503") || msg.includes("overloaded") || msg.includes("Service Unavailable") || msg.includes("quota")) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      continue;
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
  const isQuotaError = lastError?.message?.includes("429") || lastError?.message?.includes("quota");
  throw new Error(isQuotaError
    ? "Quota API Gemini telah habis. Silakan tunggu 1 menit lalu coba lagi, atau gunakan API key lain."
    : "Sistem AI sedang sibuk atau API Key tidak valid. Silakan coba lagi nanti atau gunakan deskripsi yang berbeda."
  );
}

