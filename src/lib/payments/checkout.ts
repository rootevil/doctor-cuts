import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createStripeCheckoutSession,
  expireStripeCheckoutSession,
} from "@/lib/payments/stripe";
import { paymentProvider } from "@/lib/payments/config";
import { PAYMENT_HOLD_MS } from "@/lib/payments/deposit";
import { generateManageToken } from "@/lib/booking/token";
import { routes } from "@/lib/routes";
import type { Locale } from "@/i18n/config";
import { requestOrigin } from "@/lib/http/origin";

export async function startDepositCheckout(input: {
  appointmentId: string;
  referenceCode: string;
  locale: Locale;
  amountCents: number;
  customerName: string;
  customerEmail: string;
  paymentToken: string;
}): Promise<{ ok: true; checkoutUrl: string } | { ok: false; message: string }> {
  if (paymentProvider() !== "stripe") {
    return { ok: false, message: "no_payment_provider" };
  }
  return startStripeCheckout(input);
}

async function startStripeCheckout(input: {
  appointmentId: string;
  referenceCode: string;
  locale: Locale;
  amountCents: number;
  customerName: string;
  customerEmail: string;
  paymentToken: string;
}): Promise<{ ok: true; checkoutUrl: string } | { ok: false; message: string }> {
  if (input.amountCents < 50) {
    return { ok: false, message: "stripe_amount_invalid" };
  }

  const origin = await requestOrigin();
  const returnPath = routes(input.locale).bookPayment(
    input.referenceCode,
    input.paymentToken,
  );
  const successUrl = `${origin}${returnPath}&outcome=return`;
  const cancelUrl = `${origin}${returnPath}&outcome=cancel`;

  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("appointments")
    .select("nexi_order_id")
    .eq("id", input.appointmentId)
    .eq("status", "pending")
    .eq("payment_status", "awaiting")
    .maybeSingle();
  if (!existing) return { ok: false, message: "not_payable" };

  // Column name is historical; value is a Stripe Checkout session id (cs_…).
  const previousOrder = existing.nexi_order_id as string | null;
  if (previousOrder?.startsWith("cs_")) {
    await expireStripeCheckoutSession(previousOrder);
  }

  try {
    const session = await createStripeCheckoutSession({
      appointmentId: input.appointmentId,
      referenceCode: input.referenceCode,
      amountCents: input.amountCents,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      locale: input.locale,
      successUrl,
      cancelUrl,
    });

    const expires =
      session.expiresAt != null
        ? new Date(session.expiresAt * 1000).toISOString()
        : new Date(Date.now() + PAYMENT_HOLD_MS).toISOString();
    const { data: updated, error } = await admin
      .from("appointments")
      .update({
        nexi_order_id: session.sessionId,
        nexi_security_token: null,
        payment_expires_at: expires,
        payment_status: "awaiting",
      })
      .eq("id", input.appointmentId)
      .eq("status", "pending")
      .eq("payment_status", "awaiting")
      .select("id");

    if (error || !updated?.length) {
      await expireStripeCheckoutSession(session.sessionId);
      console.warn("[payments] save stripe session failed:", error?.message);
      return { ok: false, message: error?.message ?? "not_payable" };
    }

    return { ok: true, checkoutUrl: session.checkoutUrl };
  } catch (err) {
    console.warn("[payments] stripe checkout start failed:", err);
    return { ok: false, message: "stripe_checkout_failed" };
  }
}

export function newPaymentToken() {
  return generateManageToken();
}

// --- Nexi checkout (disabled — Stripe is the only payment method) ---
// import { createNexiHostedPayment } from "@/lib/payments/nexi";
//
// export function newNexiOrderId() {
//   const time = Date.now().toString(36);
//   const entropy = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
//   return `dc${time}${entropy}`.slice(0, 18);
// }
//
// export async function startNexiCheckout(input: { ... }): Promise<...> {
//   const notificationUrl = `${origin}/api/payments/nexi`;
//   const hpp = await createNexiHostedPayment({ ... });
//   ...
// }
