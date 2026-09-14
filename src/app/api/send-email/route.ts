import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  generatePaymentReceiptHtml,
  generateOnboardingWelcomeHtml,
  PaymentReceiptEmailData,
  OnboardingWelcomeEmailData,
} from '@/lib/email-templates';

// Initialize Resend Client
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = 'both', // 'payment_receipt' | 'onboarding_welcome' | 'both'
      to,
      clientName = 'Valued Client',
      companyName = 'Client Studio',
      projectTitle = 'Digital Flagship Engineering Sprint',
      amount = 0,
      currency = 'USD',
      milestoneType = '1st Deposit (50%)',
      transactionId = `PP-TX-${Date.now().toString().slice(-6)}`,
      receiptUrl,
      portalUrl,
      servicePillar = 'Web Design & Full-Stack',
      assignedPartner = 'Nagireddy Sai Prabhath',
    } = body;

    if (!to || !to.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid recipient email (to) is required.' },
        { status: 400 }
      );
    }

    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY is not configured in environment variables.');
      return NextResponse.json(
        {
          success: false,
          error: 'Resend API key is missing. Please configure RESEND_API_KEY in .env.local',
        },
        { status: 500 }
      );
    }

    const results: { type: string; id?: string; error?: string; deliveredTo?: string }[] = [];
    const fallbackEmail = 'saiprabathn@gmail.com';

    // 1. Send Payment Receipt Email
    if (type === 'payment_receipt' || type === 'both') {
      const receiptData: PaymentReceiptEmailData = {
        clientName,
        companyName,
        projectTitle,
        amount: Number(amount) || 0,
        currency,
        milestoneType,
        transactionId,
        receiptUrl,
      };

      const receiptHtml = generatePaymentReceiptHtml(receiptData);

      try {
        let { data, error } = await resend.emails.send({
          from: `Qdelta Studio <${fromEmail}>`,
          to: [to],
          subject: `Payment Receipt — ${Number(amount).toLocaleString()} ${currency} for ${projectTitle}`,
          html: receiptHtml,
        });

        // If Resend sandbox restrictions block sending to unverified recipients, fallback to account owner for testing
        if (error && error.message?.includes('testing emails to your own email address')) {
          console.warn(`Resend sandbox mode active: Routing receipt email to ${fallbackEmail} (Target: ${to})`);
          const fallbackRes = await resend.emails.send({
            from: `Qdelta Studio <${fromEmail}>`,
            to: [fallbackEmail],
            subject: `[Client Receipt - ${to}] Payment Receipt — ${Number(amount).toLocaleString()} ${currency}`,
            html: receiptHtml,
          });
          data = fallbackRes.data;
          error = fallbackRes.error;
          if (data?.id) {
            results.push({ type: 'payment_receipt', id: data.id, deliveredTo: `${fallbackEmail} (Resend Sandbox Test)` });
          } else {
            results.push({ type: 'payment_receipt', error: error?.message || 'Sandbox delivery failed' });
          }
        } else if (error) {
          console.error('Error sending receipt email via Resend:', error);
          results.push({ type: 'payment_receipt', error: error.message });
        } else {
          results.push({ type: 'payment_receipt', id: data?.id, deliveredTo: to });
        }
      } catch (err: any) {
        console.error('Resend exception on receipt email:', err);
        results.push({ type: 'payment_receipt', error: err?.message || 'Failed to send' });
      }
    }

    // 2. Send Client Onboarding Welcome Email
    if (type === 'onboarding_welcome' || type === 'both') {
      const onboardingData: OnboardingWelcomeEmailData = {
        clientName,
        companyName,
        projectTitle,
        servicePillar,
        portalUrl,
        assignedPartner,
      };

      const welcomeHtml = generateOnboardingWelcomeHtml(onboardingData);

      try {
        let { data, error } = await resend.emails.send({
          from: `Qdelta Studio <${fromEmail}>`,
          to: [to],
          subject: `🚀 Welcome to Qdelta — Project Kickoff & Onboarding for ${companyName}`,
          html: welcomeHtml,
        });

        // If Resend sandbox restrictions block sending to unverified recipients, fallback to account owner for testing
        if (error && error.message?.includes('testing emails to your own email address')) {
          console.warn(`Resend sandbox mode active: Routing welcome email to ${fallbackEmail} (Target: ${to})`);
          const fallbackRes = await resend.emails.send({
            from: `Qdelta Studio <${fromEmail}>`,
            to: [fallbackEmail],
            subject: `[Client Onboarding - ${to}] 🚀 Welcome to Qdelta — Project Kickoff for ${companyName}`,
            html: welcomeHtml,
          });
          data = fallbackRes.data;
          error = fallbackRes.error;
          if (data?.id) {
            results.push({ type: 'onboarding_welcome', id: data.id, deliveredTo: `${fallbackEmail} (Resend Sandbox Test)` });
          } else {
            results.push({ type: 'onboarding_welcome', error: error?.message || 'Sandbox delivery failed' });
          }
        } else if (error) {
          console.error('Error sending onboarding email via Resend:', error);
          results.push({ type: 'onboarding_welcome', error: error.message });
        } else {
          results.push({ type: 'onboarding_welcome', id: data?.id, deliveredTo: to });
        }
      } catch (err: any) {
        console.error('Resend exception on onboarding email:', err);
        results.push({ type: 'onboarding_welcome', error: err?.message || 'Failed to send' });
      }
    }

    const hasAnySuccess = results.some((r) => Boolean(r.id));

    return NextResponse.json({
      success: hasAnySuccess,
      results,
      message: hasAnySuccess
        ? `Successfully sent ${results.filter((r) => r.id).length} email(s) via Resend`
        : 'Failed to deliver emails. Check Resend logs.',
    });
  } catch (error: any) {
    console.error('Server error in /api/send-email:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error processing email.' },
      { status: 500 }
    );
  }
}
