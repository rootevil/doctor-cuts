import { localeCookie, type Locale } from "@/i18n/config";

const YEAR = 60 * 60 * 24 * 365;

export function persistLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  const doc = document as Document;
  doc.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=${YEAR}; SameSite=Lax`;
}
