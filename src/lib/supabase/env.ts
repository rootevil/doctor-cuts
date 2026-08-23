export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Never import this from a client module. `process.env.SUPABASE_SERVICE_ROLE_KEY`
 * is a server-only secret; leaking it into a client bundle exposes admin access
 * to every visitor.
 */
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function requireSupabasePublicEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see README).",
    );
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

export function requireSupabaseServiceRoleEnv() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase service role is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (see README).",
    );
  }
  return { url: supabaseUrl, serviceRoleKey: supabaseServiceRoleKey };
}
