import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { expireStripeCheckoutSession, inspectStripeCheckoutSession } from "@/lib/payments/stripe";
import { refundAppointmentDeposit } from "@/lib/payments/refund";
import { completePastAppointments } from "@/lib/payments/complete";
import { syncAppointmentPayment } from "@/lib/payments/sync";
import type { AppointmentStatus } from "@/lib/supabase/types";

const CANCELLABLE: AppointmentStatus[] = ["pending", "confirmed", "arrived"];

function looksLikeStripeSessionId(id: string | null | undefined) {
  return typeof id === "string" && id.startsWith("cs_");
}

/**
 * Cancels a booking and refunds the Stripe deposit when one was captured.
 * Cancel the row before refunding paid deposits so a failed refund never
 * leaves a confirmed haircut with money already returned.
 */
export async function cancelAppointmentAndRefund(appointmentId: string): Promise<{
  ok: boolean;
  refunded: boolean;
  reason?: "not_found" | "not_cancellable" | "refund_failed" | "unknown";
  message?: string;
}> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { ok: false, refunded: false, reason: "unknown", message: "not_configured" };
  }
  await completePastAppointments();
  const admin = createSupabaseAdminClient();
  const { data: row, error } = await admin
    .from("appointments")
    .select("id, status, payment_status, ends_at, nexi_order_id")
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, refunded: false, reason: "not_found" };
  }

  const status = row.status as AppointmentStatus;

  if (status === "cancelled" && row.payment_status === "paid") {
    const refund = await refundAppointmentDeposit(appointmentId);
    if (!refund.ok) {
      return {
        ok: false,
        refunded: false,
        reason: "refund_failed",
        message: refund.message,
      };
    }
    return { ok: true, refunded: refund.refunded };
  }

  if (!CANCELLABLE.includes(status)) {
    return { ok: false, refunded: false, reason: "not_cancellable" };
  }
  if (new Date(row.ends_at) <= new Date()) {
    return { ok: false, refunded: false, reason: "not_cancellable" };
  }

  if (row.payment_status === "awaiting" && looksLikeStripeSessionId(row.nexi_order_id)) {
    await expireStripeCheckoutSession(row.nexi_order_id);
    try {
      const snapshot = await inspectStripeCheckoutSession(row.nexi_order_id);
      if (snapshot.paid) {
        const applied = await syncAppointmentPayment({ appointmentId: appointmentId });
        if (applied.paid) {
          return { ok: false, refunded: false, reason: "not_cancellable" };
        }
      }
    } catch (err) {
      console.warn("[payments] cancel inspect failed:", err);
    }
  }

  const paymentUpdate =
    row.payment_status === "awaiting"
      ? { payment_status: "failed" as const }
      : {};

  const { data: updated, error: updateError } = await admin
    .from("appointments")
    .update({
      status: "cancelled",
      ...paymentUpdate,
    })
    .eq("id", appointmentId)
    .in("status", CANCELLABLE)
    .select("id");

  if (updateError) {
    return { ok: false, refunded: false, reason: "unknown", message: updateError.message };
  }
  if (!updated?.length) {
    return { ok: false, refunded: false, reason: "not_cancellable" };
  }

  if (row.payment_status !== "paid") {
    return { ok: true, refunded: false };
  }

  const refund = await refundAppointmentDeposit(appointmentId);
  if (!refund.ok) {
    return {
      ok: false,
      refunded: false,
      reason: "refund_failed",
      message: refund.message,
    };
  }

  return { ok: true, refunded: refund.refunded };
}
