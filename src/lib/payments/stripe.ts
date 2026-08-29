import "server-only";

import Stripe from "stripe";
import { getStripe } from "@/lib/payments/config";

/** Stripe Checkout cannot expire sooner than 30 minutes after creation. */
export const STRIPE_CHECKOUT_MIN_TTL_SEC = 30 * 60;

export async function createStripeCheckoutSession(input: {
  appointmentId: string;
  referenceCode: string;
  amountCents: number;
  customerEmail: string;
  customerName: string;
  locale: "it" | "en";
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; checkoutUrl: string }> {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 50) {
    throw new Error("stripe_amount_invalid");
  }
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: input.appointmentId,
    locale: input.locale === "it" ? "it" : "en",
    expires_at: Math.floor(Date.now() / 1000) + STRIPE_CHECKOUT_MIN_TTL_SEC,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: input.amountCents,
          product_data: {
            name:
              input.locale === "it"
                ? `Acconto prenotazione ${input.referenceCode}`
                : `Booking deposit ${input.referenceCode}`,
            description:
              input.locale === "it"
                ? "Acconto di conferma Doctor Cuts — il resto in studio."
                : "Doctor Cuts confirmation deposit — remainder paid in studio.",
          },
        },
      },
    ],
    metadata: {
      appointment_id: input.appointmentId,
      reference_code: input.referenceCode,
      customer_name: input.customerName.slice(0, 120),
      expected_amount_cents: String(input.amountCents),
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  if (!session.url) throw new Error("stripe_session_missing_url");
  return { sessionId: session.id, checkoutUrl: session.url };
}

export type StripeCheckoutInspection = {
  paid: boolean;
  amountTotal: number | null;
  currency: string | null;
  appointmentId: string | null;
};

export async function inspectStripeCheckoutSession(
  sessionId: string,
): Promise<StripeCheckoutInspection> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const fromClient =
    typeof session.client_reference_id === "string"
      ? session.client_reference_id
      : null;
  const fromMeta = session.metadata?.appointment_id ?? null;
  return {
    paid: session.payment_status === "paid",
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
    appointmentId: fromClient || fromMeta,
  };
}

export async function stripeSessionIsPaid(sessionId: string): Promise<boolean> {
  const snapshot = await inspectStripeCheckoutSession(sessionId);
  return snapshot.paid;
}

export async function expireStripeCheckoutSession(sessionId: string): Promise<void> {
  const stripe = getStripe();
  try {
    await stripe.checkout.sessions.expire(sessionId);
  } catch (err) {
    if (
      err instanceof Stripe.errors.StripeInvalidRequestError &&
      (err.code === "checkout_session_expired" ||
        err.message?.toLowerCase().includes("already expired") ||
        err.message?.toLowerCase().includes("already completed"))
    ) {
      return;
    }
    console.warn("[payments] stripe session expire failed:", err);
  }
}

export async function refundStripeCheckoutSession(sessionId: string): Promise<{
  ok: boolean;
  refundId?: string;
  already?: boolean;
  message?: string;
}> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  if (!paymentIntent) {
    return { ok: false, message: "missing_payment_intent" };
  }
  try {
    const refund = await stripe.refunds.create(
      { payment_intent: paymentIntent },
      { idempotencyKey: `deposit-refund-${sessionId}` },
    );
    return { ok: true, refundId: refund.id };
  } catch (err) {
    if (
      err instanceof Stripe.errors.StripeInvalidRequestError &&
      (err.code === "charge_already_refunded" ||
        err.message?.toLowerCase().includes("already been refunded"))
    ) {
      return { ok: true, already: true };
    }
    return {
      ok: false,
      message: err instanceof Error ? err.message : "refund_failed",
    };
  }
}

export function constructStripeWebhookEvent(
  body: string | Buffer,
  signature: string,
  secret: string,
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, secret);
}
