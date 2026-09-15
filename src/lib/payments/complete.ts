import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";

/**
 * Confirmed / arrived (and paid pending) bookings whose slot has ended
 * become completed so they leave the waiting list. Free `pending` rows
 * waiting on admin confirmation are left alone.
 */
export async function completePastAppointments(now = new Date()): Promise<number> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return 0;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .update({ status: "completed" })
    .in("status", ["confirmed", "arrived"])
    .in("payment_status", ["paid", "none"])
    .lte("ends_at", now.toISOString())
    .select("id");

  if (error) {
    console.warn("[appointments] complete past failed:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}
