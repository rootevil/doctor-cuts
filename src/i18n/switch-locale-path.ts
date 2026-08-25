import { locales, type Locale } from "@/i18n/config";
import { rewriteNextParam, rewriteRestPath, splitLocalePath } from "@/i18n/path-aliases";

/** Locale-canonical path (aliases + admin reviews slug). */
export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const { rest } = splitLocalePath(pathname);
  const { rest: rewritten, hash } = rewriteRestPath(rest, nextLocale);
  const path = rewritten === "/" ? `/${nextLocale}` : `/${nextLocale}${rewritten}`;
  return `${path}${hash}`;
}

/** Full client URL for a locale switch — preserves query + hash; rewrites `next`. */
export function switchLocaleHref(
  pathname: string,
  nextLocale: Locale,
  search = "",
  hash = "",
): string {
  const path = switchLocalePath(pathname, nextLocale);
  // switchLocalePath may already include #reviews from alias rewrite
  const [pathOnly, pathHash = ""] = path.split("#");
  const finalHash = hash || (pathHash ? `#${pathHash}` : "");

  const rawQuery = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(rawQuery);
  const next = params.get("next");
  if (next) {
    const rewritten = rewriteNextParam(next, nextLocale);
    if (rewritten) params.set("next", rewritten);
    else params.delete("next");
  }

  const q = params.toString();
  return `${pathOnly}${q ? `?${q}` : ""}${finalHash}`;
}

/** @deprecated kept for clarity — locales list used by callers if needed */
export const supportedLocales = locales;
