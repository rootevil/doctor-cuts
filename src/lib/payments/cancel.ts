import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { refundAppointmentDeposit } from "@/lib/payments/refund";
import { completePastAppointments } from "@/lib/payments/complete";
import type { AppointmentStatus } from "@/lib/supabase/types";

const CANCELLABLE: AppointmentStatus[] = ["pending", "confirmed", "arrived"];

/**
 * Cancels a booking and refunds the Stripe deposit when one was captured.
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
    .select("id, status, payment_status, ends_at")
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

  let refunded = false;
  if (row.payment_status === "paid") {
    const refund = await refundAppointmentDeposit(appointmentId);
    if (!refund.ok) {
      return {
        ok: false,
        refunded: false,
        reason: "refund_failed",
        message: refund.message,
      };
    }
    refunded = refund.refunded;
  }

  const paymentUpdate =
    row.payment_status === "paid" || row.payment_status === "refunded"
      ? { payment_status: "refunded" as const }
      : row.payment_status === "awaiting"
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
    return { ok: false, refunded, reason: "unknown", message: updateError.message };
  }
  if (!updated?.length) {
    return { ok: false, refunded, reason: "not_cancellable" };
  }

  return { ok: true, refunded };
}
