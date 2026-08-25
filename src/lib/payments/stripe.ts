import "server-only";

import Stripe from "stripe";
import { getStripe } from "@/lib/payments/config";

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
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: input.appointmentId,
    locale: input.locale === "it" ? "it" : "en",
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
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  if (!session.url) throw new Error("stripe_session_missing_url");
  return { sessionId: session.id, checkoutUrl: session.url };
}

export async function stripeSessionIsPaid(sessionId: string): Promise<boolean> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return (
    session.payment_status === "paid" ||
    session.status === "complete"
  );
}

export function constructStripeWebhookEvent(
  body: string | Buffer,
  signature: string,
  secret: string,
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, secret);
}
