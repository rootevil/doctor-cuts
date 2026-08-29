import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { isStripeConfigured } from "@/lib/payments/config";
import { refundStripeCheckoutSession } from "@/lib/payments/stripe";

function looksLikeStripeSessionId(id: string) {
  return id.startsWith("cs_");
}

/**
 * Refunds a paid deposit (Stripe Checkout) and marks the row refunded.
 * No-op success if already refunded or there was never a charge.
 */
export async function refundAppointmentDeposit(appointmentId: string): Promise<{
  ok: boolean;
  refunded: boolean;
  refundId?: string;
  message?: string;
}> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { ok: false, refunded: false, message: "not_configured" };
  }
  const admin = createSupabaseAdminClient();
  const { data: row, error } = await admin
    .from("appointments")
    .select("id, payment_status, nexi_order_id, stripe_refund_id, status")
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, refunded: false, message: "not_found" };
  }
  if (row.status === "completed") {
    return { ok: false, refunded: false, message: "already_completed" };
  }
  if (row.payment_status === "refunded") {
    return { ok: true, refunded: true, refundId: row.stripe_refund_id ?? undefined };
  }
  if (row.payment_status !== "paid") {
    return { ok: true, refunded: false };
  }

  const orderId = row.nexi_order_id;
  if (!orderId || !looksLikeStripeSessionId(orderId) || !isStripeConfigured()) {
    return { ok: false, refunded: false, message: "no_stripe_charge" };
  }

  const refund = await refundStripeCheckoutSession(orderId);
  if (!refund.ok) {
    return { ok: false, refunded: false, message: refund.message };
  }

  await admin
    .from("appointments")
    .update({
      payment_status: "refunded",
      stripe_refund_id: refund.refundId ?? row.stripe_refund_id,
    })
    .eq("id", appointmentId);

  return { ok: true, refunded: true, refundId: refund.refundId };
}
