import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";

/** Release unpaid holds so the slot is bookable again. */
export async function expireStalePaymentHolds(now = new Date()): Promise<number> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return 0;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .update({
      status: "cancelled",
      payment_status: "expired",
    })
    .eq("status", "pending")
    .eq("payment_status", "awaiting")
    .lt("payment_expires_at", now.toISOString())
    .select("id");

  if (error) {
    console.warn("[payments] expire holds failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}
