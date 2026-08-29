import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { fetchNexiOrder, orderLooksPaid } from "@/lib/payments/nexi";
import {
  inspectStripeCheckoutSession,
  refundStripeCheckoutSession,
} from "@/lib/payments/stripe";
import { isStripeConfigured } from "@/lib/payments/config";
import { finalizePaidAppointment } from "@/lib/payments/finalize";
import { tokensEqual } from "@/lib/booking/token";

function looksLikeStripeSessionId(id: string) {
  return id.startsWith("cs_");
}

async function refundOrphanStripeCharge(
  appointmentId: string,
  sessionId: string,
) {
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
    .eq("id", appointmentId);
}

/**
 * Confirms a booking only after the PSP says the expected deposit was paid.
 * If the hold already expired or was cancelled, the charge is refunded.
 */
export async function syncAppointmentPayment(opts: {
  appointmentId?: string;
  orderId?: string;
  securityToken?: string | null;
}): Promise<{ ok: boolean; paid: boolean; appointmentId?: string }> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { ok: false, paid: false };
  }
  const admin = createSupabaseAdminClient();

  let query = admin
    .from("appointments")
    .select(
      "id, status, payment_status, deposit_cents, nexi_order_id, nexi_security_token",
    );

  if (opts.appointmentId) query = query.eq("id", opts.appointmentId);
  else if (opts.orderId) query = query.eq("nexi_order_id", opts.orderId);
  else return { ok: false, paid: false };

  const { data: row } = await query.maybeSingle();
  if (!row?.nexi_order_id) return { ok: false, paid: false };

  if (row.payment_status === "paid") {
    return { ok: true, paid: true, appointmentId: row.id };
  }

  const orderId = row.nexi_order_id;
  const isStripe = looksLikeStripeSessionId(orderId) && isStripeConfigured();

  if (!isStripe) {
    if (!opts.securityToken || !row.nexi_security_token) {
      return { ok: false, paid: false };
    }
    if (!tokensEqual(row.nexi_security_token, opts.securityToken)) {
      console.warn("[payments] security token mismatch");
      return { ok: false, paid: false };
    }
  }

  let paid = false;
  if (isStripe) {
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
  } else {
    const snapshot = await fetchNexiOrder(orderId);
    paid = snapshot?.paid ?? false;
  }

  if (!paid) return { ok: true, paid: false, appointmentId: row.id };

  const holdGone =
    row.status === "cancelled" ||
    row.payment_status === "expired" ||
    row.payment_status === "failed";

  if (holdGone) {
    if (isStripe) await refundOrphanStripeCharge(row.id, orderId);
    return { ok: true, paid: false, appointmentId: row.id };
  }

  const done = await finalizePaidAppointment(row.id);
  if (!done.ok && isStripe) {
    await refundOrphanStripeCharge(row.id, orderId);
  }
  return { ok: done.ok, paid: done.ok, appointmentId: row.id };
}

export function notificationLooksPaid(payload: unknown) {
  return orderLooksPaid(payload);
}
