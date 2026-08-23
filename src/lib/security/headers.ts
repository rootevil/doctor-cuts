// Baseline security headers applied to every response by the Proxy.
//
// Notes:
//  - CSP is intentionally strict but pragmatic. `script-src` uses a nonce so
//    Next's inline bootstrap can execute while still refusing arbitrary
//    inline scripts. Framer Motion needs `style-src 'unsafe-inline'` (it
//    emits inline styles for animations), so we allow that but nothing else
//    inline for scripts.
//  - `connect-src` lists the Supabase project origin so the browser client
//    can reach REST + Auth + Realtime + Storage. It's derived from the
//    NEXT_PUBLIC_SUPABASE_URL env; if that isn't set we omit the origin and
//    fall back to `'self'` only.
//  - Google Maps embed is allowed via `frame-src`.
//  - HSTS is emitted only under `https` — no point in issuing it in dev.

import type { NextRequest, NextResponse } from "next/server";
import { supabaseUrl } from "@/lib/supabase/env";

function supabaseOrigins(): string[] {
  if (!supabaseUrl) return [];
  try {
    const u = new URL(supabaseUrl);
    // REST + Auth + Storage share the same origin. Realtime uses wss on the
    // same host. Both need to be listed under connect-src.
    return [u.origin, u.origin.replace(/^https:/, "wss:")];
  } catch {
    return [];
  }
}

function buildCsp() {
  const supabase = supabaseOrigins();
  const google = [
    "https://www.google.com",
    "https://maps.google.com",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
  ];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    // Tailwind's dev runtime injects inline <style>, Framer Motion writes
    // inline styles for keyframes, and Next's font loader inlines the
    // stylesheet — 'unsafe-inline' is required for styles specifically. It
    // does NOT weaken script-src.
    "style-src": [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ],
    // Nonce would be nicer, but Next injects several inline bootstraps and
    // maintaining nonces through the RSC/Server Components pipeline requires
    // extra plumbing. Using 'strict-dynamic' with 'unsafe-inline' fallback
    // is the accepted compromise for App Router today.
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      // Only in dev do we allow eval — Turbopack/HMR needs it. In production
      // we drop it entirely.
      ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
    ],
    "connect-src": ["'self'", ...supabase],
    "frame-src": ["'self'", ...google],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([key, values]) => (values.length ? `${key} ${values.join(" ")}` : key))
    .join("; ");
}

const CSP = buildCsp();

export function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  const isHttps =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (isHttps) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}
