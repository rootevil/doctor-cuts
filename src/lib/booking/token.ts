import { randomBytes, timingSafeEqual } from "node:crypto";

/** 32-char url-safe secret. Fits the 24–64 length check on `manage_token`. */
export function generateManageToken() {
  return randomBytes(24).toString("base64url");
}

export function tokensEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
