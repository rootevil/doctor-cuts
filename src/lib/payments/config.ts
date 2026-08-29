import "server-only";

import Stripe from "stripe";

/**
 * Master switch for the €5 confirmation deposit.
 * Set BOOKING_DEPOSIT_ENABLED=true and provide STRIPE_SECRET_KEY.
 */
export function isBookingDepositEnabled() {
  return process.env.BOOKING_DEPOSIT_ENABLED === "true";
}

/**
 * Prefer a restricted key (`rk_live_…` / `rk_test_…`) with Checkout Sessions
 * and Refunds only. `sk_…` still works; a leaked sk_ can do far more.
 */
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

export function isDepositCheckoutReady() {
  if (!isBookingDepositEnabled()) return false;
  return isStripeConfigured();
}

export function paymentProvider(): "stripe" | null {
  if (!isBookingDepositEnabled()) return null;
  if (isStripeConfigured()) return "stripe";
  return null;
}

// --- Nexi XPay (disabled — Stripe is the only payment method) ---
// const SANDBOX =
//   "https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1";
// const LIVE = "https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1";
//
// export function nexiApiKey() {
//   return process.env.NEXI_API_KEY?.trim() || "";
// }
//
// export function nexiApiBaseUrl() {
//   const raw = process.env.NEXI_API_BASE_URL?.trim();
//   if (raw) return raw.replace(/\/$/, "");
//   return process.env.NODE_ENV === "production" ? LIVE : SANDBOX;
// }
//
// export function isNexiConfigured() {
//   if (!isBookingDepositEnabled()) return false;
//   return nexiApiKey().length > 0;
// }
