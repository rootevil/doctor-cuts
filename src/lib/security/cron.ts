import { timingSafeEqual } from "node:crypto";

/** Vercel Cron sends Authorization: Bearer $CRON_SECRET. Do not accept the secret in the query string. */
export function cronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
