import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generatePrdDirect(appConcept: string, language: string, apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Menggunakan gemini-1.5-flash-latest yang lebih stabil untuk endpoint v1beta
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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
    if (!response) {
      throw new Error("No response from AI");
    }
    
    let text = response.text();
    
    // Pembersihan JSON yang lebih kuat
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Cari bagian JSON jika AI masih memberikan teks tambahan
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      throw new Error("AI memberikan format yang salah. Silakan coba lagi.");
    }
  } catch (error: any) {
    console.error("Gemini Direct Detailed Error:", error);
    
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      throw new Error("Model AI tidak ditemukan atau API Key tidak valid untuk model ini. Pastikan Anda menggunakan API Key dari Google AI Studio.");
    }

    if (error.message?.includes("fetch failed")) {
      throw new Error("Koneksi ke AI terputus (Timeout). Silakan coba dengan deskripsi yang lebih singkat.");
    }
    throw new Error("Gagal menghubungi AI: " + (error.message || "Unknown error"));
  }
}

