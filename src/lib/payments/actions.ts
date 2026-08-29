"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { startDepositCheckout } from "@/lib/payments/checkout";
import { depositBreakdown } from "@/lib/payments/deposit";
import { getSettings } from "@/lib/data/settings";
import { tokensEqual } from "@/lib/booking/token";
import { isLocale, type Locale } from "@/i18n/config";
import { resolveCustomerDisplayName } from "@/lib/email/templates";
import { limitByIp, limitByKey } from "@/lib/security/rate-limit";

export async function retryDepositCheckout(input: {
  referenceCode: string;
  paymentToken: string;
  locale: Locale;
}): Promise<{ ok: true; checkoutUrl: string } | { ok: false; reason: string }> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { ok: false, reason: "not_configured" };
  }
  if (!isLocale(input.locale)) return { ok: false, reason: "invalid" };

  const ipRl = await limitByIp("retryDeposit", 5, 60 * 60_000);
  const tokenRl = await limitByKey(
    "retryDeposit",
    input.paymentToken.slice(0, 24),
    8,
    60 * 60_000,
  );
  if (!ipRl.ok || !tokenRl.ok) return { ok: false, reason: "rate_limited" };

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("appointments")
    .select(
      `
      id, status, payment_status, payment_token, deposit_cents, reference_code,
      guest_name, guest_email, customer_id, locale, payment_expires_at,
      customer:profiles ( full_name, email ),
      service:services ( price )
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
  if (
    row.payment_expires_at &&
    new Date(row.payment_expires_at).getTime() <= Date.now()
  ) {
    return { ok: false, reason: "not_payable" };
  }

  const service = Array.isArray(row.service) ? row.service[0] : row.service;
  if (!service) return { ok: false, reason: "not_payable" };

  const settings = await getSettings();
  const expectedCents = depositBreakdown(
    Number(service.price),
    settings.deposit_cents,
  ).payNowCents;
  if (expectedCents < 50) return { ok: false, reason: "not_payable" };

  await admin
    .from("appointments")
    .update({ deposit_cents: expectedCents })
    .eq("id", row.id)
    .eq("status", "pending")
    .eq("payment_status", "awaiting");

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
    amountCents: expectedCents,
    customerName: name,
    customerEmail: email,
    paymentToken: row.payment_token,
  });
  if (!checkout.ok) return { ok: false, reason: "payment_failed" };
  return { ok: true, checkoutUrl: checkout.checkoutUrl };
}
