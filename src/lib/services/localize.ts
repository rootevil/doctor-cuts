import type { Locale } from "@/i18n/config";
import { dictionaries, type Dictionary, type ServiceCopy } from "@/i18n/dictionaries";
import { services, type ServiceSlug } from "@/lib/site";

const SLUGS = new Set<string>(services.map((s) => s.slug));

export function isServiceSlug(slug: string | null | undefined): slug is ServiceSlug {
  return !!slug && SLUGS.has(slug);
}

function resolveDict(localeOrDict: Locale | Dictionary): Dictionary {
  return typeof localeOrDict === "string" ? dictionaries[localeOrDict] : localeOrDict;
}

function resolveLocale(localeOrDict: Locale | Dictionary): Locale {
  if (typeof localeOrDict === "string") return localeOrDict;
  // Dictionary identity — compare by reference to the exported maps.
  return localeOrDict === dictionaries.en ? "en" : "it";
}

/** Localized service copy from the dictionary; null if slug is unknown. */
export function getServiceCopy(
  localeOrDict: Locale | Dictionary,
  slug: string | null | undefined,
): ServiceCopy | null {
  if (!isServiceSlug(slug)) return null;
  return resolveDict(localeOrDict).services.items[slug];
}

/**
 * Display name for the active locale.
 * Never leaks the Italian DB `name` onto English pages — dictionary wins.
 * Unknown/custom slugs: use fallback only when locale is Italian (DB is Italian).
 */
export function localizedServiceName(
  localeOrDict: Locale | Dictionary,
  slug: string | null | undefined,
  fallback?: string | null,
): string {
  const copy = getServiceCopy(localeOrDict, slug);
  if (copy?.name) return copy.name;

  const locale = resolveLocale(localeOrDict);
  const trimmed = fallback?.trim();
  if (locale === "it" && trimmed) return trimmed;
  if (locale === "en" && trimmed && isLikelyEnglish(trimmed)) return trimmed;
  if (slug) return humanizeSlug(slug, locale);
  return "—";
}

export function localizedServiceBlurb(
  localeOrDict: Locale | Dictionary,
  slug: string | null | undefined,
  fallback?: string | null,
): string {
  const copy = getServiceCopy(localeOrDict, slug);
  if (copy?.blurb) return copy.blurb;

  const locale = resolveLocale(localeOrDict);
  const trimmed = fallback?.trim();
  if (locale === "it" && trimmed) return trimmed;
  return "";
}

function humanizeSlug(slug: string, locale: Locale): string {
  const words = slug.split("-").filter(Boolean);
  if (locale === "en") {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  return words.join(" ");
}

/** Rough guard so we don't show Italian DB strings on English pages. */
function isLikelyEnglish(text: string): boolean {
  // Common Italian service words that must not appear in English copy
  return !/\b(taglio|sfumatura|maschera|massaggio|filo|bambino|sopracciglia|viso|lavaggio|capelli)\b/i.test(
    text,
  );
}
