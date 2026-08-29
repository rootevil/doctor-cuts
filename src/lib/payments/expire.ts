import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import {
  expireStripeCheckoutSession,
  inspectStripeCheckoutSession,
} from "@/lib/payments/stripe";
import { syncAppointmentPayment } from "@/lib/payments/sync";

function looksLikeStripeSessionId(id: string) {
  return id.startsWith("cs_");
}

/**
 * Close Stripe Checkout *before* freeing the chair.
 * If the customer already paid, confirm the booking instead of releasing
 * the slot (never charge-then-refund a valid on-time payment).
 */
async function closeUnpaidHold(row: {
  id: string;
  nexi_order_id: string | null;
}): Promise<"released" | "confirmed" | "skipped"> {
  const sessionId = row.nexi_order_id;
  if (sessionId && looksLikeStripeSessionId(sessionId)) {
    try {
      const before = await inspectStripeCheckoutSession(sessionId);
      if (before.paid) {
        const done = await syncAppointmentPayment({ appointmentId: row.id });
        return done.paid ? "confirmed" : "skipped";
      }
    } catch (err) {
      console.warn("[payments] inspect before expire failed:", err);
    }

    await expireStripeCheckoutSession(sessionId);

    try {
      const after = await inspectStripeCheckoutSession(sessionId);
      if (after.paid) {
        const done = await syncAppointmentPayment({ appointmentId: row.id });
        return done.paid ? "confirmed" : "skipped";
      }
    } catch (err) {
      console.warn("[payments] inspect after expire failed:", err);
    }
  }

  const admin = createSupabaseAdminClient();
  const { data: updated, error } = await admin
    .from("appointments")
    .update({
      status: "cancelled",
      payment_status: "expired",
    })
    .eq("id", row.id)
    .eq("status", "pending")
    .eq("payment_status", "awaiting")
    .select("id");

  if (error) {
    console.warn("[payments] release hold failed:", error.message);
    return "skipped";
  }
  return updated?.length ? "released" : "skipped";
}

/** Release unpaid holds so the slot is bookable again. */
export async function expireStalePaymentHolds(now = new Date()): Promise<number> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return 0;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .select("id, nexi_order_id")
    .eq("status", "pending")
    .eq("payment_status", "awaiting")
    .lt("payment_expires_at", now.toISOString());

  if (error) {
    console.warn("[payments] list stale holds failed:", error.message);
    return 0;
  }

  let released = 0;
  for (const row of data ?? []) {
    const result = await closeUnpaidHold({
      id: row.id as string,
      nexi_order_id: (row.nexi_order_id as string | null) ?? null,
    });
    if (result === "released") released += 1;
  }

  return released;
}
