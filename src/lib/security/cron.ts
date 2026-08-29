/** Vercel Cron sends Authorization: Bearer $CRON_SECRET. Do not accept the secret in the query string. */
export function cronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
