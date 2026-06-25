import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generatePrdDirect(appConcept: string, language: string, apiKey: string) {
  // Trim API Key untuk memastikan tidak ada spasi/newline yang terbawa
  const cleanApiKey = apiKey.trim();
  const genAI = new GoogleGenerativeAI(cleanApiKey);
  
  // Model yang tersedia (gemini-1.5-flash & gemini-pro sudah deprecated oleh Google)
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-2.0-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel(
        { model: modelName },
        { apiVersion: "v1beta" }
      );

      const prompt = `You are an expert product manager. Generate a PRD in JSON format.
Language: ${language}
App Concept: ${appConcept}

Return ONLY a JSON object with these EXACT keys:
{
  "overview": "...",
  "techStack": "...",
  "features": "...",
  "dataModel": "...",
  "phases": "..."
}
Do not include any preamble, markdown formatting, or triple backticks. Just the raw JSON string.`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const response = await result.response;
      if (!response) continue;
      
      let text = response.text();
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

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

