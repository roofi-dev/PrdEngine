import { NextResponse } from 'next/server';
import { generateClarifyingQuestions } from '@/lib/ai-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  const groqApiKey = process.env.GROQ_API_KEY;

  if (!apiKey && !groqApiKey) {
    console.error("CRITICAL: No API Key found in process.env at Runtime");
    return NextResponse.json(
      { error: "No API Key found. Set GROQ_API_KEY or GEMINI_API_KEY in your .env file." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { appConcept, language } = body;

    if (!appConcept) {
      return NextResponse.json(
        { error: 'App concept is required' },
        { status: 400 }
      );
    }

    const questions = await generateClarifyingQuestions(appConcept, language || 'English', apiKey || '', groqApiKey);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Error in API Route /api/clarify-prd:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during clarifying questions generation' },
      { status: 500 }
    );
  }
}
