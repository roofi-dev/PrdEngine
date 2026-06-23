import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generatePrdDirect(appConcept: string, language: string, apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  try {
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
    let text = response.text();
    
    // Pembersihan JSON yang lebih kuat
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Cari bagian JSON jika AI masih memberikan teks tambahan
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Direct Detailed Error:", error);
    if (error.message?.includes("fetch failed")) {
      throw new Error("Koneksi ke AI terputus (Timeout). Silakan coba dengan deskripsi yang lebih singkat.");
    }
    throw new Error("Gagal menghubungi AI: " + (error.message || "Unknown error"));
  }
}

