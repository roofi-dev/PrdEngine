import { NextResponse } from 'next/server';
import { generatePrdFromConcept } from '@/ai/flows/generate-prd-from-concept';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appConcept, language } = body;

    if (!appConcept) {
      return NextResponse.json(
        { error: 'App concept is required' },
        { status: 400 }
      );
    }

    // Panggil flow Genkit di sisi server
    const result = await generatePrdFromConcept({
      appConcept,
      language: language || 'English',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in API Route /api/generate-prd:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during PRD generation' },
      { status: 500 }
    );
  }
}
