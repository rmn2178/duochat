import { createClient } from '@supabase/supabase-js';

/**
 * Create a request-scoped Supabase client that respects RLS.
 * The access token should be the user's session JWT.
 */
export function createServerSupabase(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

/**
 * Create a Supabase client with the service role key.
 * Bypasses RLS — use ONLY in trusted server routes (e.g. upload signed URLs).
 * NEVER expose this client or its key to the browser.
 */
export function createServiceRoleSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
