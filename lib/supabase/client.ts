import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for browser use.
 *
 * Since the session JWT is stored in an httpOnly cookie (not readable from JS),
 * the access token must be passed down from a server component via props/context.
 */
export function createBrowserSupabase(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      realtime: {
        params: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}
