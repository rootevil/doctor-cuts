import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import {
  inspectStripeCheckoutSession,
  refundStripeCheckoutSession,
} from "@/lib/payments/stripe";
import { isStripeConfigured } from "@/lib/payments/config";
import { finalizePaidAppointment } from "@/lib/payments/finalize";
import {
  fetchAppointmentPaymentState,
  isConfirmedPaid,
  isHoldGone,
} from "@/lib/payments/state";

function looksLikeStripeSessionId(id: string) {
  return id.startsWith("cs_");
}

/**
 * Refunds a charge that cannot become a booking. Never overwrites a
 * confirmed+paid row (webhook and return URL can race).
 */
async function refundOrphanStripeCharge(
  appointmentId: string,
  sessionId: string,
) {
  const state = await fetchAppointmentPaymentState(appointmentId);
  if (isConfirmedPaid(state)) {
    console.warn("[payments] skip orphan refund — booking already confirmed");
    return;
  }

  const refund = await refundStripeCheckoutSession(sessionId);
  if (!refund.ok) {
    console.warn("[payments] orphan refund failed:", refund.message);
    return;
  }

  const admin = createSupabaseAdminClient();
  await admin
    .from("appointments")
    .update({
      payment_status: "refunded",
      stripe_refund_id: refund.refundId ?? null,
    })
    .eq("id", appointmentId)
    .neq("status", "confirmed");
}

/**
 * Confirms a booking only after Stripe says the expected deposit was paid.
 * If the hold already expired or was cancelled, the charge is refunded.
 */
export async function syncAppointmentPayment(opts: {
  appointmentId?: string;
  orderId?: string;
}): Promise<{ ok: boolean; paid: boolean; appointmentId?: string }> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { ok: false, paid: false };
  }
  if (!isStripeConfigured()) {
    return { ok: false, paid: false };
  }

  const admin = createSupabaseAdminClient();

  let query = admin
    .from("appointments")
    .select("id, status, payment_status, deposit_cents, nexi_order_id");

  if (opts.appointmentId) query = query.eq("id", opts.appointmentId);
  else if (opts.orderId) query = query.eq("nexi_order_id", opts.orderId);
  else return { ok: false, paid: false };

  const { data: row } = await query.maybeSingle();
  if (!row?.nexi_order_id) return { ok: false, paid: false };

  if (row.payment_status === "paid" && row.status === "confirmed") {
    return { ok: true, paid: true, appointmentId: row.id };
  }

  const orderId = row.nexi_order_id;
  if (!looksLikeStripeSessionId(orderId)) {
    return { ok: false, paid: false, appointmentId: row.id };
  }

  let paid = false;
  try {
    const snapshot = await inspectStripeCheckoutSession(orderId);
    const amountOk =
      snapshot.currency === "eur" &&
      snapshot.amountTotal === Number(row.deposit_cents) &&
      snapshot.appointmentId === row.id;
    if (snapshot.paid && !amountOk) {
      await refundOrphanStripeCharge(row.id, orderId);
      console.warn("[payments] stripe amount mismatch, refunded");
      return { ok: true, paid: false, appointmentId: row.id };
    }
    paid = snapshot.paid && amountOk;
  } catch (err) {
    console.warn("[payments] stripe session sync failed:", err);
    return { ok: false, paid: false, appointmentId: row.id };
  }

  if (!paid) return { ok: true, paid: false, appointmentId: row.id };

  const holdGone =
    row.status === "cancelled" ||
    row.payment_status === "expired" ||
    row.payment_status === "failed";

  if (holdGone) {
    await refundOrphanStripeCharge(row.id, orderId);
    return { ok: true, paid: false, appointmentId: row.id };
  }

  const done = await finalizePaidAppointment(row.id);
  if (done.ok) {
    return { ok: true, paid: true, appointmentId: row.id };
  }

  const fresh = await fetchAppointmentPaymentState(row.id);
  if (isConfirmedPaid(fresh)) {
    return { ok: true, paid: true, appointmentId: row.id };
  }

  if (isHoldGone(fresh)) {
    await refundOrphanStripeCharge(row.id, orderId);
    return { ok: true, paid: false, appointmentId: row.id };
  }

  console.warn(
    "[payments] finalize failed while hold still active — no refund (webhook may retry)",
  );
  return { ok: false, paid: false, appointmentId: row.id };
}
