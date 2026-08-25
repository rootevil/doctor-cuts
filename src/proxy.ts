import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, isLocale, localeCookie } from "@/i18n/config";
import { canonicalizePathname } from "@/i18n/path-aliases";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";
import { routes } from "@/lib/routes";
import { applySecurityHeaders } from "@/lib/security/headers";
import { isAllowedAdminEmail } from "@/lib/auth/admin-email";

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

function resolvePreferredLocale(request: NextRequest) {
  const cookie = request.cookies.get(localeCookie)?.value;
  if (isLocale(cookie ?? "")) return cookie as typeof defaultLocale;
  return localeFromHeader(request.headers.get("accept-language"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathLocale = localeFromPath(pathname);
  const preferredLocale = pathLocale ?? resolvePreferredLocale(request);

  // Canonicalize English aliases → Italian segments, ensure locale prefix.
  const canonical = canonicalizePathname(pathname, preferredLocale);
  if (canonical.changed) {
    const url = request.nextUrl.clone();
    url.pathname = canonical.pathname;
    if (canonical.hash) {
      url.hash = canonical.hash.replace(/^#/, "");
    }
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(localeCookie, preferredLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: false,
    });
    return applySecurityHeaders(redirect, request);
  }

  const currentLocale = pathLocale ?? preferredLocale;

  // Persist locale cookie when missing / mismatched.
  const { response, user, role } = await refreshSupabaseSession(request);
  if (!request.cookies.get(localeCookie)?.value || pathLocale) {
    response.cookies.set(localeCookie, currentLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: false,
    });
  }

  // Auth gates for /account and /admin
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
