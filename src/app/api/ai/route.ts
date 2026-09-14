import { NextResponse } from 'next/server';
import { generateGeminiProposal, extractTasksFromVoice } from '@/lib/google-ai';
import { sanitizeObject, checkRateLimit, getAuthenticatedSession } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Authenticated Agency Staff Verification (JWT Token)
    const session = getAuthenticatedSession(req);
    if (!session.authenticated || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid Agency Staff JWT session required to execute AI tasks.' },
        { status: 401 }
      );
    }

    // 2. IP Rate Limiting (Max 20 AI requests/min per IP)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateCheck = checkRateLimit(`ai-api:${clientIp}`, 20, 60000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `AI Rate Limit exceeded. Please wait ${rateCheck.resetInSec}s.` },
        { status: 429 }
      );
    }

    const { action, payload } = await req.json();

    if (!action || !payload) {
      return NextResponse.json({ error: 'Missing action or payload parameters.' }, { status: 400 });
    }

    // 2. Sanitize Payload
    const cleanPayload = sanitizeObject(payload);

    if (action === 'generate-sow') {
      const result = await generateGeminiProposal(cleanPayload);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'extract-voice') {
      const transcript = typeof cleanPayload.transcript === 'string' ? cleanPayload.transcript.slice(0, 5000) : '';
      const result = await extractTasksFromVoice(transcript);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Unknown action parameter.' }, { status: 400 });
  } catch (error: any) {
    console.error('AI API Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process AI request.' },
      { status: 500 }
    );
  }
}

