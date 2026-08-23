"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "./env";

/**
 * Browser-side Supabase client. Reads the anon key from the client bundle —
 * never introduce the service role here.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
