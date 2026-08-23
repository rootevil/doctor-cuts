// This file replaces the deprecated `middleware.ts` convention (Next 16
// renamed it to `proxy`). It handles three concerns per request:
//   1. Locale prefixing + persistence (defaults from cookie, then
//      Accept-Language, then the site default).
//   2. Supabase session cookie refresh + role resolution.
//   3. Auth gating for `/account/**` and `/admin/**`.
//   4. Baseline security headers on every response.
//
// The Data Security guide explicitly warns that Proxy is not a substitute
// for per-action authorization checks — `requireAdminClient()` in every
// admin action still enforces the same rules server-side.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, isLocale, localeCookie } from "@/i18n/config";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";
import { routes } from "@/lib/routes";
import { applySecurityHeaders } from "@/lib/security/headers";

function localeFromHeader(header: string | null) {
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Locale prefix
  const currentLocale = localeFromPath(pathname);
  if (!currentLocale) {
    const cookie = request.cookies.get(localeCookie)?.value;
    const locale = isLocale(cookie ?? "")
      ? cookie
      : localeFromHeader(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(localeCookie, locale ?? defaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: false, // language pref must be readable from client toggles
    });
    return applySecurityHeaders(redirect, request);
  }

  // 2. Supabase session refresh + role
  const { response, user, role } = await refreshSupabaseSession(request);

  // 3. Auth gates for /account and /admin
  const rest = pathname.slice(`/${currentLocale}`.length) || "/";
  const r = routes(currentLocale);

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
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = r.home;
      return applySecurityHeaders(NextResponse.redirect(url), request);
    }
  }

  return applySecurityHeaders(response, request);
}

export const config = {
  // Skip Next internals, static assets, and the public folder.
  matcher: ["/((?!_next|images|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
