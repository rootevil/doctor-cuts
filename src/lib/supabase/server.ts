import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "./env";

/**
 * Request-scoped Supabase client backed by the Next.js cookie store.
 * Use inside Server Components, Route Handlers, and Server Actions.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // Called from a Server Component — mutation is a no-op here;
          // the middleware refresh covers session cookies for the next request.
        }
      },
    },
  });
}
