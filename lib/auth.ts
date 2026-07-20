import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import type { SessionUser } from '@/types';

const COOKIE_NAME = 'duo_session';

// User configs from environment variables
function getUserConfigs() {
  return [
    {
      id: process.env.USER_A_ID!,
      name: process.env.USER_A_NAME!,
      phone: process.env.USER_A_PHONE!,
      secretCode: process.env.USER_A_CODE!,
    },
    {
      id: process.env.USER_B_ID!,
      name: process.env.USER_B_NAME!,
      phone: process.env.USER_B_PHONE!,
      secretCode: process.env.USER_B_CODE!,
    },
  ];
}

/**
 * Find user config by phone number.
 */
export function getUserByPhone(phone: string) {
  const users = getUserConfigs();
  return users.find((u) => u.phone === phone) || null;
}

/**
 * Get user config by ID.
 */
export function getUserById(id: string) {
  const users = getUserConfigs();
  return users.find((u) => u.id === id) || null;
}

/**
 * Get the partner (the other user) for a given user ID.
 */
export function getPartnerConfig(userId: string) {
  const users = getUserConfigs();
  return users.find((u) => u.id !== userId) || null;
}

/**
 * Sign a Supabase-compatible JWT for the given user ID.
 * This JWT is used both as the session cookie AND as the Supabase auth token.
 */
export async function signSessionJwt(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

  return new SignJWT({
    sub: userId,
    role: 'authenticated',
    aud: 'authenticated',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

/**
 * Verify and decode a session JWT.
 */
export async function verifySessionJwt(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret, {
      audience: 'authenticated',
    });
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get the current session user from the cookie. Server-only.
 * Returns { id, name } or null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const payload = await verifySessionJwt(sessionCookie.value);
  if (!payload?.sub) {
    return null;
  }

  const user = getUserById(payload.sub);
  if (!user) {
    return null;
  }

  return { id: user.id, name: user.name };
}

/**
 * Get the raw session token from the cookie. Server-only.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  return sessionCookie?.value || null;
}

export { COOKIE_NAME };
