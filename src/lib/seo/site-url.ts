/**
 * Canonical site URL used for absolute links in metadata, sitemaps, JSON-LD,
 * OG images, and transactional emails. Set NEXT_PUBLIC_SITE_URL for
 * production; falls back to the Vercel URL if present, otherwise localhost.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export function absolute(path: string) {
  if (!path.startsWith("/")) return `${siteUrl}/${path}`;
  return `${siteUrl}${path}`;
}
