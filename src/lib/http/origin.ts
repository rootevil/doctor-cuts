import { headers } from "next/headers";
import { siteUrl } from "@/lib/seo/site-url";

/** Prefer configured public URL; fall back to the incoming Host header. */
export async function requestOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return siteUrl;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
