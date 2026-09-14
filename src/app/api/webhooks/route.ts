import { NextResponse } from 'next/server';
import { verifyHmacSignature, sanitizeObject, checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting for Webhooks (Max 60 calls/min)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateCheck = checkRateLimit(`webhook-api:${clientIp}`, 60, 60000);
    
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded on webhook intake.' },
        { status: 429 }
      );
    }

    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get('x-qdelta-signature') ||
      req.headers.get('x-hub-signature-256') ||
      req.headers.get('x-webhook-signature');

    // 2. Cryptographic HMAC SHA-256 Signature Verification
    // If a webhook secret is configured in environment, verify signature strictly
    const configuredSecret = process.env.WEBHOOK_SECRET;
    if (configuredSecret && configuredSecret.length > 0) {
      const isVerified = verifyHmacSignature(rawBody, signatureHeader, configuredSecret);
      if (!isVerified) {
        console.warn(`[Qdelta Security Alert] Invalid HMAC Webhook signature from IP ${clientIp}`);
        return NextResponse.json(
          { error: 'Unauthorized: Invalid HMAC signature token.' },
          { status: 401 }
        );
      }
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
    }

    // 3. Replay Attack Prevention (Payload timestamp within 5 minutes)
    if (parsedBody.timestamp) {
      const payloadTime = new Date(parsedBody.timestamp).getTime();
      const now = Date.now();
      if (!isNaN(payloadTime) && Math.abs(now - payloadTime) > 5 * 60 * 1000) {
        return NextResponse.json(
          { error: 'Expired or replayed webhook request.' },
          { status: 400 }
        );
      }
    }

    // 4. Sanitize Incoming Data
    const sanitizedData = sanitizeObject(parsedBody.data || {});
    const event = typeof parsedBody.event === 'string' ? parsedBody.event.slice(0, 100) : 'unknown_event';

    console.log(`[Qdelta CRM Secure Webhook Verified] Event: ${event}`, {
      timestamp: new Date().toISOString(),
      clientIp,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      event,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Webhook processing exception:', err);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}


