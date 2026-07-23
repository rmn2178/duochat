import { NextResponse } from 'next/server';
import { getUserByPhone, signSessionJwt, COOKIE_NAME } from '@/lib/auth';
import { createServiceRoleSupabase } from '@/lib/supabase/server';
import { compareCode } from '@/lib/crypto';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function checkRateLimit(ip: string): Promise<boolean> {
  const supabase = createServiceRoleSupabase();
  const now = new Date();
  
  const { data: entry } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip', ip)
    .single();

  if (!entry || new Date(entry.reset_at) < now) {
    const resetAt = new Date(now.getTime() + WINDOW_MS);
    await supabase.from('rate_limits').upsert({
      ip,
      count: 1,
      reset_at: resetAt.toISOString(),
    });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  await supabase.from('rate_limits').update({ count: entry.count + 1 }).eq('ip', ip);
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!(await checkRateLimit(ip))) {
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
    const isValid = await compareCode(code, user.secretCode);
    
    if (!isValid) {
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
