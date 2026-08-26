import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { rewriteNextParam, rewriteRestPath, splitLocalePath } from "@/i18n/path-aliases";

/** Public path for the current page (Italian prefix + canonical segments). */
export function switchLocalePath(pathname: string): string {
  const { rest } = splitLocalePath(pathname);
  const { rest: rewritten, hash } = rewriteRestPath(rest, defaultLocale);
  const path =
    rewritten === "/" ? `/${defaultLocale}` : `/${defaultLocale}${rewritten}`;
  return `${path}${hash}`;
}

/** Full client URL after a language switch — same Italian path; preserves query + hash. */
export function switchLocaleHref(
  pathname: string,
  nextLocale: Locale,
  search = "",
  hash = "",
): string {
  void nextLocale;
  const path = switchLocalePath(pathname);
  const [pathOnly, pathHash = ""] = path.split("#");
  const finalHash = hash || (pathHash ? `#${pathHash}` : "");

  const rawQuery = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(rawQuery);
  const next = params.get("next");
  if (next) {
    const rewritten = rewriteNextParam(next);
    if (rewritten) params.set("next", rewritten);
    else params.delete("next");
  }

  const q = params.toString();
  return `${pathOnly}${q ? `?${q}` : ""}${finalHash}`;
}

/** @deprecated kept for clarity — locales list used by callers if needed */
export const supportedLocales = locales;
