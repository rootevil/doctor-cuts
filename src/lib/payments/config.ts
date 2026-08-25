import "server-only";

import Stripe from "stripe";

const SANDBOX =
  "https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1";
const LIVE = "https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1";

/**
 * Master switch for the €5 confirmation deposit.
 * Set BOOKING_DEPOSIT_ENABLED=true and provide Stripe (or Nexi) keys.
 */
export function isBookingDepositEnabled() {
  return process.env.BOOKING_DEPOSIT_ENABLED === "true";
}

export function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

export function stripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
}

export function isStripeConfigured() {
  return stripeSecretKey().length > 0;
}

let stripeClient: Stripe | null = null;

export function getStripe() {
  const key = stripeSecretKey();
  if (!key) throw new Error("stripe_not_configured");
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function nexiApiKey() {
  return process.env.NEXI_API_KEY?.trim() || "";
}

export function nexiApiBaseUrl() {
  const raw = process.env.NEXI_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return process.env.NODE_ENV === "production" ? LIVE : SANDBOX;
}

export function isNexiConfigured() {
  if (!isBookingDepositEnabled()) return false;
  return nexiApiKey().length > 0;
}

/** Prefer Stripe when enabled; fall back to Nexi. */
export function isDepositCheckoutReady() {
  if (!isBookingDepositEnabled()) return false;
  return isStripeConfigured() || nexiApiKey().length > 0;
}

export function paymentProvider(): "stripe" | "nexi" | null {
  if (!isBookingDepositEnabled()) return null;
  if (isStripeConfigured()) return "stripe";
  if (nexiApiKey().length > 0) return "nexi";
  return null;
}
