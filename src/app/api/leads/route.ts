import { NextResponse } from 'next/server';
import { sanitizeString, isValidEmail, checkRateLimit } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. IP-Based Sliding Window Rate Limiting (Max 15 requests/min per IP)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateCheck = checkRateLimit(`lead-api:${clientIp}`, 15, 60000);
    
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many submissions. Please wait ${rateCheck.resetInSec} seconds before retrying.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetInSec),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json();

    // 2. Honeypot Bot Trap (Invisible field filled only by automated spam scrapers)
    if (body._bot_hp || body._website_check) {
      return NextResponse.json({
        success: true,
        message: 'Inquiry received successfully and added to Qdelta CRM pipeline.',
      });
    }

    const rawName = body.name;
    const rawEmail = body.email;
    const rawCompany = body.company;
    const rawPhone = body.phone;
    const rawServiceType = body.serviceType;
    const rawDetails = body.details;
    const rawBudget = body.budget;
    const rawTimeline = body.timeline;

    // 3. Required Field Validation & Format Verification
    if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
      return NextResponse.json({ error: 'Valid client or contact name is required.' }, { status: 400 });
    }

    if (!rawEmail || typeof rawEmail !== 'string' || !isValidEmail(rawEmail)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    // 4. Strict XSS Sanitization
    const name = sanitizeString(rawName).slice(0, 100);
    const email = sanitizeString(rawEmail).slice(0, 150).toLowerCase();
    const company = sanitizeString(rawCompany || '').slice(0, 120);
    const phone = sanitizeString(rawPhone || '').slice(0, 50);
    const serviceType = sanitizeString(rawServiceType || 'Landing Pages').slice(0, 100);
    const details = sanitizeString(rawDetails || 'Inquiry submitted via Qdelta website.').slice(0, 2000);
    const budget = sanitizeString(rawBudget || 'To be scoped').slice(0, 50);
    const timeline = sanitizeString(rawTimeline || '4 Weeks').slice(0, 50);

    const newLead = {
      id: `lead-${Date.now()}`,
      name,
      email,
      company,
      phone,
      serviceType,
      details,
      budget,
      timeline,
      source: 'Landing Page Form',
      status: 'New',
      assignedTo: 'Nagireddy Sai Prabhath',
      handlingMode: 'In-House',
      quoteAmount: 3500,
      currency: 'USD',
      leadScore: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully and added to Qdelta CRM pipeline.',
      lead: newLead,
    });
  } catch (error) {
    console.error('Lead API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while ingesting lead.' },
      { status: 500 }
    );
  }
}


