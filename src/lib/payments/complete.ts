import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";

/**
 * Paid (or legacy free) bookings whose slot has ended become completed
 * so they leave the pending/waiting list.
 */
export async function completePastAppointments(now = new Date()): Promise<number> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return 0;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .update({ status: "completed" })
    .in("status", ["pending", "confirmed", "arrived"])
    .in("payment_status", ["paid", "none"])
    .lte("ends_at", now.toISOString())
    .select("id");

  if (error) {
    console.warn("[appointments] complete past failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}
