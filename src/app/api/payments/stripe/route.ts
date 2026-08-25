import { NextResponse } from "next/server";
import {
  constructStripeWebhookEvent,
  stripeSessionIsPaid,
} from "@/lib/payments/stripe";
import {
  isStripeConfigured,
  stripeWebhookSecret,
} from "@/lib/payments/config";
import { applyPaidNotification } from "@/lib/payments/sync";

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
    const session = event.data.object as {
      id?: string;
      payment_status?: string;
      metadata?: { appointment_id?: string };
    };
    const sessionId = session.id;
    if (!sessionId) return NextResponse.json({ ok: true });

    const paid =
      session.payment_status === "paid" ||
      (await stripeSessionIsPaid(sessionId).catch(() => false));
    if (!paid) return NextResponse.json({ ok: true, paid: false });

    const applied = await applyPaidNotification({
      orderId: sessionId,
    });
    return NextResponse.json({ ok: applied.ok, paid: applied.ok });
  }

  return NextResponse.json({ ok: true, ignored: event.type });
}
