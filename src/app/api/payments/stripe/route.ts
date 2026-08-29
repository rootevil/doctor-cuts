import { NextResponse } from "next/server";
import { constructStripeWebhookEvent } from "@/lib/payments/stripe";
import {
  isStripeConfigured,
  stripeWebhookSecret,
} from "@/lib/payments/config";
import { syncAppointmentPayment } from "@/lib/payments/sync";
import { expireStalePaymentHolds } from "@/lib/payments/expire";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — confirms the booking if the customer never returns
 * from Checkout (or returns before our sync runs).
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const secret = stripeWebhookSecret();
  if (!secret) {
    console.warn("[stripe] STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ ok: false, error: "webhook_secret_missing" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const body = await request.text();
  let event;
  try {
    event = constructStripeWebhookEvent(body, signature, secret);
  } catch (err) {
    console.warn("[stripe] webhook signature failed:", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as { id?: string };
    const sessionId = session.id;
    if (!sessionId) return NextResponse.json({ ok: true });

    const applied = await syncAppointmentPayment({ orderId: sessionId });
    return NextResponse.json({ ok: applied.ok, paid: applied.paid });
  }

  if (event.type === "checkout.session.expired") {
    await expireStalePaymentHolds();
    return NextResponse.json({ ok: true, expired: true });
  }

  return NextResponse.json({ ok: true, ignored: event.type });
}
