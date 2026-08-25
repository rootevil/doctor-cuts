import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNexiHostedPayment } from "@/lib/payments/nexi";
import { createStripeCheckoutSession } from "@/lib/payments/stripe";
import { paymentProvider } from "@/lib/payments/config";
import { PAYMENT_HOLD_MS } from "@/lib/payments/deposit";
import { generateManageToken } from "@/lib/booking/token";
import { routes } from "@/lib/routes";
import type { Locale } from "@/i18n/config";
import { requestOrigin } from "@/lib/http/origin";

export function newNexiOrderId() {
  // Nexi rejects orderIds that are too long (29+ fails; 20 works).
  const time = Date.now().toString(36);
  const entropy = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
  return `dc${time}${entropy}`.slice(0, 18);
}

export async function startDepositCheckout(input: {
  appointmentId: string;
  referenceCode: string;
  locale: Locale;
  amountCents: number;
  customerName: string;
  customerEmail: string;
  paymentToken: string;
}): Promise<{ ok: true; checkoutUrl: string } | { ok: false; message: string }> {
  const provider = paymentProvider();
  if (provider === "stripe") return startStripeCheckout(input);
  if (provider === "nexi") return startNexiCheckout(input);
  return { ok: false, message: "no_payment_provider" };
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
  const origin = await requestOrigin();
  const returnPath = routes(input.locale).bookPayment(
    input.referenceCode,
    input.paymentToken,
  );
  const successUrl = `${origin}${returnPath}&outcome=return`;
  const cancelUrl = `${origin}${returnPath}&outcome=cancel`;

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

    const admin = createSupabaseAdminClient();
    const expires = new Date(Date.now() + PAYMENT_HOLD_MS).toISOString();
    const { error } = await admin
      .from("appointments")
      .update({
        nexi_order_id: session.sessionId,
        nexi_security_token: null,
        payment_expires_at: expires,
        payment_status: "awaiting",
      })
      .eq("id", input.appointmentId);

    if (error) {
      console.warn("[payments] save stripe session failed:", error.message);
      return { ok: false, message: error.message };
    }

    return { ok: true, checkoutUrl: session.checkoutUrl };
  } catch (err) {
    console.warn("[payments] stripe checkout start failed:", err);
    return { ok: false, message: "stripe_checkout_failed" };
  }
}

/** @deprecated Prefer startDepositCheckout — kept for Nexi path internals. */
export async function startNexiCheckout(input: {
  appointmentId: string;
  referenceCode: string;
  locale: Locale;
  amountCents: number;
  customerName: string;
  customerEmail: string;
  paymentToken: string;
}): Promise<{ ok: true; checkoutUrl: string } | { ok: false; message: string }> {
  const origin = await requestOrigin();
  const returnPath = routes(input.locale).bookPayment(
    input.referenceCode,
    input.paymentToken,
  );
  const resultUrl = `${origin}${returnPath}&outcome=return`;
  const cancelUrl = `${origin}${returnPath}&outcome=cancel`;
  const notificationUrl = `${origin}/api/payments/nexi`;
  const orderId = newNexiOrderId();

  try {
    const hpp = await createNexiHostedPayment({
      orderId,
      amountCents: input.amountCents,
      description: `Doctor Cuts ${input.referenceCode}`,
      customField: input.appointmentId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      language: input.locale === "it" ? "ita" : "eng",
      resultUrl,
      cancelUrl,
      notificationUrl,
    });

    const admin = createSupabaseAdminClient();
    const expires = new Date(Date.now() + PAYMENT_HOLD_MS).toISOString();
    const { error } = await admin
      .from("appointments")
      .update({
        nexi_order_id: orderId,
        nexi_security_token: hpp.securityToken || null,
        payment_expires_at: expires,
        payment_status: "awaiting",
      })
      .eq("id", input.appointmentId);

    if (error) {
      console.warn("[payments] save order id failed:", error.message);
      return { ok: false, message: error.message };
    }

    return { ok: true, checkoutUrl: hpp.hostedPage };
  } catch (err) {
    console.warn("[payments] nexi checkout start failed:", err);
    return { ok: false, message: "nexi_hpp_failed" };
  }
}

export function newPaymentToken() {
  return generateManageToken();
}
