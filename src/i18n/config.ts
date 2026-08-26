export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "it";
export const localeCookie = "NEXT_LOCALE";

/** Public URL prefix. English is a content language, not a second route tree. */
export const urlLocaleParams: { locale: Locale }[] = [{ locale: defaultLocale }];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
