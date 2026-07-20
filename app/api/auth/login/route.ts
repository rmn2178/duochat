import { NextResponse } from 'next/server';
import { getUserByPhone, signSessionJwt, COOKIE_NAME } from '@/lib/auth';

// Simple in-memory rate limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const phone = body.phone?.trim();
    const code = body.code?.trim();

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'Phone number and code are required.' },
        { status: 400 }
      );
    }

    // Find user by phone number
    const user = getUserByPhone(phone);
    if (!user) {
      // Generic error — don't reveal which field was wrong
      return NextResponse.json(
        { success: false, error: 'Invalid phone number or code.' },
        { status: 401 }
      );
    }

    // Verify the secret code against the environment variable
    console.log('--- DEBUG AUTH ---');
    console.log('Expected Code:', user.secretCode);
    console.log('Provided Code:', code);
    
    if (code !== user.secretCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number or code.' },
        { status: 401 }
      );
    }

    // Sign a Supabase-compatible JWT
    const token = await signSessionJwt(user.id);

    // Set the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
