import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, isLocale, localeCookie, type Locale } from "@/i18n/config";
import { canonicalizePathname, splitLocalePath } from "@/i18n/path-aliases";
import { contentLocaleHeader } from "@/i18n/request-locale";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";
import { routes } from "@/lib/routes";
import { applySecurityHeaders } from "@/lib/security/headers";
import { isAllowedAdminEmail } from "@/lib/auth/admin-email";

const LOCALE_COOKIE_ATTRS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  httpOnly: false,
};

function localeFromHeader(header: string | null): Locale {
  if (!header) return defaultLocale;
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().slice(0, 2).toLowerCase());
  for (const code of preferred) {
    if (code && isLocale(code)) return code;
  }
  return defaultLocale;
}

function localeFromPath(pathname: string) {
  const first = pathname.split("/")[1];
  return isLocale(first) ? first : null;
}

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(localeCookie, locale, LOCALE_COOKIE_ATTRS);
}

function resolveContentLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(localeCookie)?.value;
  if (isLocale(cookie ?? "")) return cookie as Locale;
  return localeFromHeader(request.headers.get("accept-language"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathLocale = localeFromPath(pathname);
  const existingCookie = request.cookies.get(localeCookie)?.value;
  const contentLocale = resolveContentLocale(request);

  // Public URLs are always `/it/...`. English aliases and `/en/...` redirect here.
  const canonical = canonicalizePathname(pathname);
  if (canonical.changed) {
    const url = request.nextUrl.clone();
    url.pathname = canonical.pathname;
    if (canonical.hash) {
      url.hash = canonical.hash.replace(/^#/, "");
    }
    const redirect = NextResponse.redirect(url);
    const cookieValue: Locale = isLocale(existingCookie ?? "")
      ? (existingCookie as Locale)
      : pathLocale === "en"
        ? "en"
        : contentLocale;
    setLocaleCookie(redirect, cookieValue);
    return applySecurityHeaders(redirect, request);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(contentLocaleHeader, contentLocale);

  const { response, user, role } = await refreshSupabaseSession(
    request,
    requestHeaders,
  );
  if (!existingCookie) {
    setLocaleCookie(response, contentLocale);
  }

  const { rest } = splitLocalePath(pathname);
  const r = routes();

  const needsAuth = rest === "/account" || rest.startsWith("/account/");
  const needsAdmin = rest === "/admin" || rest.startsWith("/admin/");

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = r.signIn;
    url.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(url), request);
  }

  if (needsAdmin) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = r.signIn;
      url.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(url), request);
    }
    if (role !== "admin" || !isAllowedAdminEmail(user.email)) {
      const url = request.nextUrl.clone();
      url.pathname = r.home;
      return applySecurityHeaders(NextResponse.redirect(url), request);
    }
  }

  return applySecurityHeaders(response, request);
}

export const config = {
  matcher: [
    "/((?!_next|api|images|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
