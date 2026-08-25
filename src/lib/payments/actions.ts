"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { startDepositCheckout } from "@/lib/payments/checkout";
import { tokensEqual } from "@/lib/booking/token";
import { isLocale, type Locale } from "@/i18n/config";
import { resolveCustomerDisplayName } from "@/lib/email/templates";

export async function retryDepositCheckout(input: {
  referenceCode: string;
  paymentToken: string;
  locale: Locale;
}): Promise<{ ok: true; checkoutUrl: string } | { ok: false; reason: string }> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { ok: false, reason: "not_configured" };
  }
  if (!isLocale(input.locale)) return { ok: false, reason: "invalid" };

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("appointments")
    .select(
      `
      id, status, payment_status, payment_token, deposit_cents, reference_code,
      guest_name, guest_email, customer_id, locale,
      customer:profiles ( full_name, email )
    `,
    )
    .eq("reference_code", input.referenceCode.toUpperCase())
    .maybeSingle();

  if (!row?.payment_token) return { ok: false, reason: "not_found" };
  if (!tokensEqual(row.payment_token, input.paymentToken)) {
    return { ok: false, reason: "not_found" };
  }
  if (row.status !== "pending" || row.payment_status !== "awaiting") {
    return { ok: false, reason: "not_payable" };
  }

  const profile = Array.isArray(row.customer) ? row.customer[0] : row.customer;
  const email = (row.guest_email || profile?.email || "").trim();
  const name = resolveCustomerDisplayName({
    fullName: profile?.full_name,
    guestName: row.guest_name,
    email,
  });
  if (!email) return { ok: false, reason: "not_payable" };

  const checkout = await startDepositCheckout({
    appointmentId: row.id,
    referenceCode: row.reference_code,
    locale: input.locale,
    amountCents: row.deposit_cents,
    customerName: name,
    customerEmail: email,
    paymentToken: row.payment_token,
  });
  if (!checkout.ok) return { ok: false, reason: "payment_failed" };
  return { ok: true, checkoutUrl: checkout.checkoutUrl };
}
