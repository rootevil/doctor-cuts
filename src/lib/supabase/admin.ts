import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requireSupabaseServiceRoleEnv } from "./env";

/**
 * Service-role client. Bypasses RLS. Only reach for this from server-only
 * modules for privileged operations (seeding, admin bootstrap, back-office
 * jobs). Never expose to the browser.
 */
export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = requireSupabaseServiceRoleEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
