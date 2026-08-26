import { defaultLocale, isLocale, localeCookie, type Locale } from "@/i18n/config";

const YEAR = 60 * 60 * 24 * 365;

export function persistLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  const doc = document as Document;
  doc.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=${YEAR}; SameSite=Lax`;
}

export function readPersistedLocale(fallback: Locale = defaultLocale): Locale {
  if (typeof document === "undefined") return fallback;
  const match = document.cookie.match(new RegExp(`(?:^|; )${localeCookie}=([^;]*)`));
  const value = match?.[1];
  return isLocale(value ?? "") ? (value as Locale) : fallback;
}
