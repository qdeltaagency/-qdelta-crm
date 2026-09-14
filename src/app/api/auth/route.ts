import { NextResponse } from 'next/server';
import {
  createJwtToken,
  verifyJwtToken,
  getAuthenticatedSession,
  checkRateLimit,
  sanitizeString,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const PARTNER_ROLES: Record<string, string> = {
  'Nagireddy Sai Prabhath': 'Managing Partner / Product Lead',
  'MD Qais': 'Executive Partner / Growth',
  'MD Fazeel': 'Technical Partner / Architecture',
  'Master Admin': 'Master Administrator',
};

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'verify';

    // ========================================================================
    // 1. ACTION: LOGIN (Generate Cryptographic JWT Token)
    // ========================================================================
    if (action === 'login') {
      // Anti-Brute-Force Rate Limiting (8 failed attempts per 15 minutes per IP)
      const rateLimitKey = `auth-login:${clientIp}`;
      const rateCheck = checkRateLimit(rateLimitKey, 8, 15 * 60 * 1000);

      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            error: `Too many login attempts from this IP. Account locked for security. Please retry in ${rateCheck.resetInSec} seconds.`,
          },
          { status: 429 }
        );
      }

      const rawPartner = body.partnerName || body.username || 'Master Admin';
      const rawPasskey = body.passkey || body.password || '';

      const partnerName = sanitizeString(rawPartner);
      const passkey = String(rawPasskey).trim();

      if (!passkey) {
        return NextResponse.json({ error: 'Security passkey is required to access agency workspace.' }, { status: 400 });
      }

      const configuredPasskey = process.env.AGENCY_MASTER_PASSKEY || 'qdelta2026';

      // Check Master Passkey
      const isPasskeyValid = passkey === configuredPasskey;

      if (!isPasskeyValid) {
        return NextResponse.json(
          {
            error: 'Invalid security passkey. Access denied.',
            remainingAttempts: rateCheck.remaining,
          },
          { status: 401 }
        );
      }

      // Determine role
      const role = PARTNER_ROLES[partnerName] || 'Agency Partner';

      // Issue signed JWT token (7 Days expiration)
      const token = createJwtToken({
        user: partnerName,
        role,
        authMethod: 'passkey',
        ip: clientIp,
      });

      const response = NextResponse.json({
        success: true,
        message: `Welcome back, ${partnerName}. Identity cryptographically verified.`,
        token,
        user: {
          name: partnerName,
          role,
        },
      });

      // Set secure HTTP cookie
      response.cookies.set({
        name: 'qdelta_auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 3600, // 7 Days
      });

      return response;
    }

    // ========================================================================
    // 2. ACTION: VERIFY (Cryptographic Token Validation)
    // ========================================================================
    if (action === 'verify') {
      const explicitToken = body.token;
      let sessionResult;

      if (explicitToken && typeof explicitToken === 'string') {
        const verify = verifyJwtToken(explicitToken);
        sessionResult = {
          authenticated: verify.valid,
          user: verify.payload,
          error: verify.error,
        };
      } else {
        sessionResult = getAuthenticatedSession(req);
      }

      if (!sessionResult.authenticated || !sessionResult.user) {
        return NextResponse.json(
          {
            authenticated: false,
            error: sessionResult.error || 'Invalid or expired session token.',
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        authenticated: true,
        user: sessionResult.user,
      });
    }

    // ========================================================================
    // 3. ACTION: LOGOUT
    // ========================================================================
    if (action === 'logout') {
      const response = NextResponse.json({
        success: true,
        message: 'Agency staff session terminated successfully.',
      });

      // Clear cookie
      response.cookies.set({
        name: 'qdelta_auth_token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json({ error: 'Unknown action specified.' }, { status: 400 });
  } catch (error: any) {
    console.error('Authentication API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
