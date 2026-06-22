import { NextResponse } from 'next/server';
import { generatePrdDirect } from '@/lib/ai-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Ambil API Key di sini (Level Request)
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_GENAI_API_KEY || 
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: No API Key found in process.env at Runtime");
    return NextResponse.json(
      { error: "Netlify belum membaca API Key Anda. Langkah: 1. Masuk ke Site Settings > Environment Variables. 2. Pastikan GEMINI_API_KEY sudah benar. 3. Klik Deploys > Trigger Deploy > Deploy Site (WAJIB)." },
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

    // Teruskan apiKey ke service
    const result = await generatePrdDirect(appConcept, language || 'English', apiKey);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in API Route /api/generate-prd:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during PRD generation' },
      { status: 500 }
    );
  }
}
