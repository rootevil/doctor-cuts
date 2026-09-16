import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { expireStripeCheckoutSession, inspectStripeCheckoutSession } from "@/lib/payments/stripe";
import { refundAppointmentDeposit } from "@/lib/payments/refund";
import { completePastAppointments } from "@/lib/payments/complete";
import { syncAppointmentPayment } from "@/lib/payments/sync";
import type { AppointmentStatus } from "@/lib/supabase/types";

const CANCELLABLE: AppointmentStatus[] = ["pending", "confirmed", "arrived"];

function looksLikeStripeSessionId(id: string | null | undefined): id is string {
  return typeof id === "string" && id.startsWith("cs_");
}

type AppointmentCancelRow = {
  id: string;
  status: string;
  payment_status: string;
  ends_at: string;
  nexi_order_id: string | null;
};

async function fetchCancelRow(
  appointmentId: string,
): Promise<AppointmentCancelRow | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .select("id, status, payment_status, ends_at, nexi_order_id")
    .eq("id", appointmentId)
    .maybeSingle();
  if (error || !data) return null;
  return data as AppointmentCancelRow;
}

/**
 * Cancels a booking and refunds the Stripe deposit when one was captured.
 * Cancel the row before refunding paid deposits so a failed refund never
 * leaves a confirmed haircut with money already returned.
 *
 * Race-safe against webhook finalize: re-reads the row and conditions the
 * cancel update on the observed payment_status so a just-paid booking is
 * never marked failed without a refund.
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

  let row = await fetchCancelRow(appointmentId);
  if (!row) {
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

  // Unpaid Checkout hold: close the session, then re-sync. If payment landed,
  // treat as a paid cancel (refund path below) instead of wiping the charge.
  const checkoutSessionId = row.nexi_order_id;
  if (row.payment_status === "awaiting" && looksLikeStripeSessionId(checkoutSessionId)) {
    await expireStripeCheckoutSession(checkoutSessionId);
    try {
      const snapshot = await inspectStripeCheckoutSession(checkoutSessionId);
      if (snapshot.paid) {
        await syncAppointmentPayment({ appointmentId });
      }
    } catch (err) {
      console.warn("[payments] cancel inspect failed:", err);
    }
    const refreshed = await fetchCancelRow(appointmentId);
    if (!refreshed) {
      return { ok: false, refunded: false, reason: "not_found" };
    }
    row = refreshed;
    if (!CANCELLABLE.includes(row.status as AppointmentStatus)) {
      return { ok: false, refunded: false, reason: "not_cancellable" };
    }
  }

  const expectedPaymentStatus = row.payment_status;
  const paymentUpdate =
    expectedPaymentStatus === "awaiting"
      ? { payment_status: "failed" as const }
      : {};

  const admin = createSupabaseAdminClient();
  const { data: updated, error: updateError } = await admin
    .from("appointments")
    .update({
      status: "cancelled",
      ...paymentUpdate,
    })
    .eq("id", appointmentId)
    .in("status", CANCELLABLE)
    .eq("payment_status", expectedPaymentStatus)
    .select("id");

  if (updateError) {
    return { ok: false, refunded: false, reason: "unknown", message: updateError.message };
  }
  if (!updated?.length) {
    // Likely raced with webhook finalize — do not claim success or skip refund.
    return { ok: false, refunded: false, reason: "not_cancellable" };
  }

  if (expectedPaymentStatus !== "paid") {
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
