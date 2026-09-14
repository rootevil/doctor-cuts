import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { shopDateBoundsUtc, shopToday, shiftDate } from "@/lib/booking/timezone";
import { expireStalePaymentHolds } from "@/lib/payments/expire";
import { completePastAppointments } from "@/lib/payments/complete";
import { syncAppointmentPayment } from "@/lib/payments/sync";
import type {
  PaymentLedgerRow,
  PaymentRange,
  PaymentTotals,
} from "@/lib/admin/payment-types";

export type { PaymentLedgerRow, PaymentRange, PaymentTotals };

function rangeBounds(range: PaymentRange): { from?: string; to?: string } {
  const today = shopToday();
  if (range === "all") return {};
  if (range === "today") return { from: today, to: today };
  if (range === "week") return { from: shiftDate(today, -6), to: today };
  return { from: shiftDate(today, -29), to: today };
}

export async function listPaymentLedger(
  range: PaymentRange = "month",
): Promise<{ rows: PaymentLedgerRow[]; totals: PaymentTotals }> {
  const empty: PaymentTotals = {
    collectedCents: 0,
    refundedCents: 0,
    awaitingCents: 0,
    collectedCount: 0,
    refundedCount: 0,
    awaitingCount: 0,
  };
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { rows: [], totals: empty };
  }

  await expireStalePaymentHolds();
  await completePastAppointments();

  const admin = createSupabaseAdminClient();
  const bounds = rangeBounds(range);
  let query = admin
    .from("appointments")
    .select(
      `
      id, starts_at, reference_code, payment_status, deposit_cents, status,
      guest_name, guest_email, nexi_order_id, created_at,
      customer:profiles ( full_name, email ),
      service:services ( name )
    `,
    )
    .in("payment_status", ["paid", "refunded", "awaiting"])
    .order("created_at", { ascending: false })
    .limit(500);

  if (bounds.from) {
    query = query.gte("created_at", shopDateBoundsUtc(bounds.from).startUtc);
  }
  if (bounds.to) {
    query = query.lt("created_at", shopDateBoundsUtc(bounds.to).endUtc);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("[admin] payment ledger:", error.message);
    return { rows: [], totals: empty };
  }

  const rows: PaymentLedgerRow[] = (data ?? []).map((raw) => {
    const r = raw as Record<string, unknown>;
    const customer = Array.isArray(r.customer) ? r.customer[0] : r.customer;
    const service = Array.isArray(r.service) ? r.service[0] : r.service;
    const c = (customer ?? null) as
      | { full_name: string | null; email: string | null }
      | null;
    const s = (service ?? null) as { name: string | null } | null;
    return {
      id: r.id as string,
      starts_at: r.starts_at as string,
      reference_code: r.reference_code as string,
      payment_status: (r.payment_status as string) ?? "none",
      deposit_cents: Number(r.deposit_cents ?? 0),
      status: r.status as string,
      guest_name: (r.guest_name as string | null) ?? null,
      guest_email: (r.guest_email as string | null) ?? null,
      customer_name: c?.full_name ?? null,
      customer_email: c?.email ?? null,
      service_name: s?.name ?? null,
      stripe_session: (r.nexi_order_id as string | null) ?? null,
      created_at: r.created_at as string,
    };
  });

  const totals = rows.reduce<PaymentTotals>((acc, row) => {
    if (row.payment_status === "paid") {
      acc.collectedCents += row.deposit_cents;
      acc.collectedCount += 1;
    } else if (row.payment_status === "refunded") {
      acc.refundedCents += row.deposit_cents;
      acc.refundedCount += 1;
    } else if (row.payment_status === "awaiting") {
      acc.awaitingCents += row.deposit_cents;
      acc.awaitingCount += 1;
    }
    return acc;
  }, empty);

  return { rows, totals };
}

/** Re-check open Stripe Checkout holds against Stripe. */
export async function syncAwaitingPayments() {
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { checked: 0, paid: 0 };
  }
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("appointments")
    .select("id, nexi_order_id")
    .eq("payment_status", "awaiting")
    .not("nexi_order_id", "is", null)
    .limit(50);

  let paid = 0;
  for (const row of data ?? []) {
    const sessionId = row.nexi_order_id as string;
    if (!sessionId.startsWith("cs_")) continue;
    const res = await syncAppointmentPayment({ appointmentId: row.id as string });
    if (res.paid) paid += 1;
  }
  return { checked: data?.length ?? 0, paid };
}
