import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { fetchNexiOrder, orderLooksPaid } from "@/lib/payments/nexi";
import { stripeSessionIsPaid } from "@/lib/payments/stripe";
import { isStripeConfigured } from "@/lib/payments/config";
import { finalizePaidAppointment } from "@/lib/payments/finalize";
import { tokensEqual } from "@/lib/booking/token";
import { uuidSchema } from "@/lib/security/schemas";

function looksLikeStripeSessionId(id: string) {
  return id.startsWith("cs_");
}

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
      "id, status, payment_status, nexi_order_id, nexi_security_token, payment_expires_at",
    );

  if (opts.appointmentId) query = query.eq("id", opts.appointmentId);
  else if (opts.orderId) query = query.eq("nexi_order_id", opts.orderId);
  else return { ok: false, paid: false };

  const { data: row } = await query.maybeSingle();
  if (!row?.nexi_order_id) return { ok: false, paid: false };

  if (row.payment_status === "paid") {
    return { ok: true, paid: true, appointmentId: row.id };
  }

  if (
    opts.securityToken &&
    row.nexi_security_token &&
    !tokensEqual(row.nexi_security_token, opts.securityToken)
  ) {
    console.warn("[payments] security token mismatch");
    return { ok: false, paid: false };
  }

  let paid = false;
  if (looksLikeStripeSessionId(row.nexi_order_id) && isStripeConfigured()) {
    try {
      paid = await stripeSessionIsPaid(row.nexi_order_id);
    } catch (err) {
      console.warn("[payments] stripe session sync failed:", err);
      return { ok: false, paid: false, appointmentId: row.id };
    }
  } else {
    const snapshot = await fetchNexiOrder(row.nexi_order_id);
    paid = snapshot?.paid ?? false;
  }

  if (!paid) return { ok: true, paid: false, appointmentId: row.id };

  const done = await finalizePaidAppointment(row.id);
  return { ok: done.ok, paid: done.ok, appointmentId: row.id };
}

export async function applyPaidNotification(opts: {
  orderId: string;
  securityToken?: string | null;
}): Promise<{ ok: boolean }> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return { ok: false };
  const admin = createSupabaseAdminClient();
  const byOrder = await admin
    .from("appointments")
    .select("id, payment_status, nexi_security_token")
    .eq("nexi_order_id", opts.orderId)
    .maybeSingle();
  let row = byOrder.data;
  if (!row && uuidSchema.safeParse(opts.orderId).success) {
    const byId = await admin
      .from("appointments")
      .select("id, payment_status, nexi_security_token")
      .eq("id", opts.orderId)
      .maybeSingle();
    row = byId.data;
  }
  if (!row) return { ok: false };
  if (
    opts.securityToken &&
    row.nexi_security_token &&
    !tokensEqual(row.nexi_security_token, opts.securityToken)
  ) {
    return { ok: false };
  }
  if (row.payment_status === "paid") return { ok: true };
  const done = await finalizePaidAppointment(row.id);
  return { ok: done.ok };
}

export function notificationLooksPaid(payload: unknown) {
  return orderLooksPaid(payload);
}
