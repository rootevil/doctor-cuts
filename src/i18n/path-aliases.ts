import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * English (and other) path aliases → Italian canonical segments.
 * Spec: path segments stay Italian; aliases may redirect for SEO / UX.
 *
 * Input/output are pathnames WITHOUT a leading locale when using
 * `rewriteRestPath`. Use `canonicalizePathname` for full `/{locale}/...` URLs.
 */

type RewriteResult = {
  /** Path after locale, e.g. `/servizi` or `/` */
  rest: string;
  /** Optional hash to append (e.g. `#reviews`) */
  hash: string;
};

/**
 * Prefix rules applied to the path *after* the locale segment.
 * More specific rules first.
 */
const REST_RULES: Array<{
  match: RegExp;
  to: string | ((locale: Locale) => string);
  hash?: string;
}> = [
  { match: /^\/account\/appointments(?=\/|$)/, to: "/account/appuntamenti" },
  { match: /^\/admin\/appointments(?=\/|$)/, to: "/admin/appuntamenti" },
  { match: /^\/admin\/services(?=\/|$)/, to: "/admin/servizi" },
  { match: /^\/admin\/hours(?=\/|$)/, to: "/admin/orari" },
  { match: /^\/admin\/customers(?=\/|$)/, to: "/admin/clienti" },
  { match: /^\/admin\/clients(?=\/|$)/, to: "/admin/clienti" },
  { match: /^\/admin\/gallery(?=\/|$)/, to: "/admin/galleria" },
  { match: /^\/admin\/settings(?=\/|$)/, to: "/admin/impostazioni" },
  { match: /^\/admin\/reviews(?=\/|$)/, to: "/admin/recensioni" },
  { match: /^\/manage-booking(?=\/|$)/, to: "/gestisci-prenotazione" },
  { match: /^\/services(?=\/|$)/, to: "/servizi" },
  { match: /^\/gallery(?=\/|$)/, to: "/galleria" },
  { match: /^\/about(?=\/|$)/, to: "/storia" },
  { match: /^\/contacts?(?=\/|$)/, to: "/contatti" },
  { match: /^\/booking(?=\/|$)/, to: "/prenota" },
  { match: /^\/book(?=\/|$)/, to: "/prenota" },
  { match: /^\/sign-in(?=\/|$)/, to: "/accedi" },
  { match: /^\/signin(?=\/|$)/, to: "/accedi" },
  { match: /^\/login(?=\/|$)/, to: "/accedi" },
  { match: /^\/sign-up(?=\/|$)/, to: "/registrati" },
  { match: /^\/signup(?=\/|$)/, to: "/registrati" },
  { match: /^\/register(?=\/|$)/, to: "/registrati" },
  { match: /^\/reviews(?=\/|$)/, to: "/", hash: "#reviews" },
];

export function splitLocalePath(pathname: string): {
  locale: Locale | null;
  rest: string;
} {
  const clean = pathname.split("?")[0]?.split("#")[0] || "/";
  const segments = clean.split("/").filter(Boolean);
  if (segments[0] && isLocale(segments[0])) {
    const rest = segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/";
    return { locale: segments[0] as Locale, rest };
  }
  return {
    locale: null,
    rest: clean.startsWith("/") ? clean || "/" : `/${clean}`,
  };
}

/** Rewrite English (etc.) aliases in the post-locale path. */
export function rewriteRestPath(rest: string, locale: Locale): RewriteResult {
  let path = rest.startsWith("/") ? rest : `/${rest}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  let hash = "";

  for (const rule of REST_RULES) {
    if (!rule.match.test(path)) continue;
    const replacement = typeof rule.to === "function" ? rule.to(locale) : rule.to;
    path = path.replace(rule.match, replacement);
    if (rule.hash) hash = rule.hash;
    break; // one structural rewrite is enough; nested aliases are covered by specific rules
  }

  // Second pass for remaining admin/public aliases if first rule only fixed a prefix
  // (e.g. /admin/services/nuovo already handled by /admin/services rule).
  return { rest: path || "/", hash };
}

/**
 * Full canonical (public) pathname.
 * - Always uses the Italian locale prefix
 * - Rewrites English aliases to Italian segments
 */
export function canonicalizePathname(pathname: string): {
  pathname: string;
  hash: string;
  changed: boolean;
} {
  const { rest } = splitLocalePath(pathname);
  const { rest: rewritten, hash } = rewriteRestPath(rest, defaultLocale);
  const nextPath =
    rewritten === "/" ? `/${defaultLocale}` : `/${defaultLocale}${rewritten}`;
  const inputClean = pathname.split("?")[0]?.split("#")[0] || "/";
  const normalizedInput =
    inputClean.length > 1 && inputClean.endsWith("/")
      ? inputClean.slice(0, -1)
      : inputClean;

  return {
    pathname: nextPath,
    hash,
    changed: normalizedInput !== nextPath || Boolean(hash),
  };
}

/** Rewrite a `next` redirect target into the Italian canonical path. */
export function rewriteNextParam(nextValue: string): string | null {
  if (!nextValue.startsWith("/")) return null;
  try {
    const url = new URL(nextValue, "http://local.invalid");
    const { rest } = splitLocalePath(url.pathname);
    const { rest: rewritten, hash: aliasHash } = rewriteRestPath(rest, defaultLocale);
    const pathname =
      rewritten === "/" ? `/${defaultLocale}` : `/${defaultLocale}${rewritten}`;
    return `${pathname}${url.search}${aliasHash || url.hash}`;
  } catch {
    return null;
  }
}
