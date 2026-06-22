import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generatePrdDirect(appConcept: string, language: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key Gemini tidak ditemukan di environment variables Netlify.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert product manager assistant.
Your task is to generate a structured Product Requirements Document (PRD) based on the app concept provided. 
CRITICAL: You MUST generate all content in the following language: ${language}.

App Concept: ${appConcept}

Please return the response in a strict JSON format with the following keys:
- overview: A 3-line description of the product.
- techStack: A list of primary technologies.
- features: Key features categorized by module.
- dataModel: Main database tables and relationships.
- phases: A 4-phase development plan.

Return ONLY the JSON object, no other text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Bersihkan jika AI memberikan format markdown ```json ... ```
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Direct Error:", error);
    throw new Error("Gagal menghubungi AI: " + (error.message || "Unknown error"));
  }
}
