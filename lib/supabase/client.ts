import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client. Uses the public anon key — safe to expose,
 * since Row Level Security on every table enforces per-user data isolation.
 * Never put the service role key in any file that ships to the client.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
