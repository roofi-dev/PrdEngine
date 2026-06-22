import { NextResponse } from 'next/server';
import { generatePrdDirect } from '@/lib/ai-service';

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

    // Gunakan service direct yang lebih stabil
    const result = await generatePrdDirect(appConcept, language || 'English');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in API Route /api/generate-prd:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during PRD generation' },
      { status: 500 }
    );
  }
}
