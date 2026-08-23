export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "it";
export const localeCookie = "NEXT_LOCALE";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
