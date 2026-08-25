import { locales, type Locale } from "@/i18n/config";

/** Locale-canonical admin review slug (EN: reviews, IT: recensioni). */
function canonicalizeAdminReviewsPath(pathname: string, nextLocale: Locale): string {
  const reviewsRe = /\/admin\/(reviews|recensioni)(?=\/|$)/;
  if (!reviewsRe.test(pathname)) return pathname;
  const slug = nextLocale === "en" ? "reviews" : "recensioni";
  return pathname.replace(reviewsRe, `/admin/${slug}`);
}

/** Swap the locale segment in a pathname, keeping the rest of the path intact. */
export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    segments[0] = nextLocale;
  } else {
    segments.unshift(nextLocale);
  }

  const swapped = `/${segments.join("/")}`;
  return canonicalizeAdminReviewsPath(swapped, nextLocale);
}

/** Full client URL for a locale switch — preserves query + hash. */
export function switchLocaleHref(
  pathname: string,
  nextLocale: Locale,
  search = "",
  hash = "",
): string {
  const path = switchLocalePath(pathname, nextLocale);
  const query = search.startsWith("?") || search === "" ? search : `?${search}`;
  return `${path}${query}${hash}`;
}
