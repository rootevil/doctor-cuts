import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, localeCookie, type Locale } from "@/i18n/config";

export const contentLocaleHeader = "x-content-locale";

/** Content language from cookie/header. Public URLs stay Italian. */
export async function requestLocale(fallback: Locale = defaultLocale): Promise<Locale> {
  const h = await headers();
  const fromHeader = h.get(contentLocaleHeader);
  if (isLocale(fromHeader ?? "")) return fromHeader as Locale;

  const jar = await cookies();
  const fromCookie = jar.get(localeCookie)?.value;
  if (isLocale(fromCookie ?? "")) return fromCookie as Locale;

  return isLocale(fallback) ? fallback : defaultLocale;
}
