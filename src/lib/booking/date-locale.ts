import { it, enUS } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";
import type { Locale } from "@/i18n/config";

export function dateFnsLocale(locale: Locale): DateFnsLocale {
  return locale === "it" ? it : enUS;
}
