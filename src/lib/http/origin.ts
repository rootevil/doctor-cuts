import { siteUrl } from "@/lib/seo/site-url";

/**
 * Canonical origin for Checkout return URLs and emails.
 * Never derived from the Host header — that would let an attacker point
 * Stripe success/cancel URLs at another site.
 */
export async function requestOrigin() {
  return siteUrl;
}
