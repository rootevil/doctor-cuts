# Doctor Cuts — Acceptance Checklist

Last automated run: passes `npm run lint`, `npx tsc --noEmit`, `npm run build`
(52 routes, 0 errors, 0 warnings apart from unrelated npm devdir notice).

Use this document as the smoke-test guide before every deploy. Anything
marked "manual" isn't covered by unit tests — walk through it in a real
browser.

---

## 1. Build health

| Check | Command | Expected |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Build | `npm run build` | exit 0, 52 routes |
| Runtime | `npm run dev` then `curl -sI http://localhost:3000/it` | 200, security headers present |

## 2. Security (Phase 6)

- [x] Proxy (renamed from middleware) applies CSP, HSTS (https only),
      X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
      Permissions-Policy on every response.
- [x] `next.config.ts` has `poweredByHeader: false`.
- [x] Every server action validates its FormData through a zod schema in
      `src/lib/security/schemas.ts` (auth, booking, admin, settings).
- [x] Rate limits: `signIn` (5 per IP / 5 min, 5 per email / 15 min),
      `signUp` (3 per IP / hour), `slots` (60 per IP / min), `createBooking`
      (10 per user / hour, 20 per IP / hour), `cancelBooking` (20 per user /
      hour). Backed by in-memory buckets — swap to Redis in prod when the
      site scales past one instance (see `src/lib/security/rate-limit.ts`).
- [x] Free-text length caps enforced server-side: notes ≤ 500,
      admin_notes ≤ 2000, service description ≤ 2000, name ≤ 120, etc.
- [x] `is_admin()` DB function is SECURITY DEFINER with pinned search_path
      (migration `00000000000006_is_admin_definer.sql`) — no more RLS
      recursion.
- [x] Service role key never imported from a client module (checked in
      `src/lib/supabase/env.ts` doc comment; RLS-safe fallback where the key
      isn't required).
- [x] Sign-in `next` param sanitised to Italian `/it` relative paths only
      (no open redirect).

**Manual**

- [ ] From a fresh browser session, fail sign-in 6 times in a row → 6th
      attempt shows the "tooMany" copy.
- [ ] Attempt a booking without being signed in → redirect to `/accedi`.
- [ ] Attempt `POST /it/admin/…` as a non-admin → still bounced by
      `requireAdminClient()` inside the action even if you bypass the proxy.

## 3. Performance + SEO (Phase 7)

- [x] `metadataBase`, title template, OG, Twitter defaults in root layout.
- [x] Every public page has canonical + hreflang (`it`, `x-default`) on
      Italian URLs. English is a content language, not a second URL.
- [x] LocalBusiness JSON-LD emitted from the locale layout.
- [x] Service pages emit Service + BreadcrumbList JSON-LD.
- [x] `sitemap.xml` includes all public pages + all live services on
      Italian `/it/...` URLs (`it` + `x-default` alternates).
- [x] `robots.txt` blocks `/it/account`, `/it/admin`,
      `/it/gestisci-prenotazione`, leftover `/en`, `/api`.
- [x] Preconnect to Supabase + fonts.gstatic.com in root `<head>`.
- [x] `next/image` configured with AVIF/WebP formats + Supabase Storage
      hostname in `remotePatterns`.
- [x] Fonts loaded with `display: "swap"`.

**Manual**

- [ ] Run Lighthouse (mobile) on `/it` → 90+ Performance, 95+ Accessibility,
      100 Best Practices, 100 SEO. First contentful paint <1.5 s on 4G.
- [ ] View source on `/it/servizi/signature-cut` → three JSON-LD blocks
      present (LocalBusiness, Service, BreadcrumbList).
- [ ] Fetch `/sitemap.xml` in production → absolute URLs use
      `NEXT_PUBLIC_SITE_URL`.

## 4. Mobile polish (Phase 8)

- [x] Viewport meta uses `viewportFit: "cover"` for notched devices.
- [x] `<body>` respects `env(safe-area-inset-*)` for left/right; utility
      classes exposed for top/bottom.
- [x] Mobile BookBar consumes bottom safe-area padding and has a 44px+
      tap target.
- [x] All text inputs enforce ≥16px font-size in `globals.css` so iOS
      Safari doesn't zoom.
- [x] Mobile hamburger + close buttons are 44×44 minimum with
      `aria-expanded`, `aria-controls`, `aria-label`.
- [x] Auth + booking forms use `autoComplete` values matching WHATWG
      (email, current-password, new-password, tel, name).

**Manual**

- [ ] iPhone: rotate portrait ↔ landscape → no horizontal scroll, safe
      areas respected.
- [ ] iPhone: tap the "Prenota" bar → does not overlap the Location
      section on the homepage.
- [ ] Android Chrome: keyboard opens on `<input type="email">` without
      zooming.
- [ ] Focus a form field with Tab → visible brass focus ring.

## 5. Accessibility (Phase 9)

- [x] Skip-to-content link at top of every locale page, visible on focus.
- [x] `:focus-visible` outline in brass, 2 px, 3 px offset.
- [x] `prefers-reduced-motion` collapses transitions + Framer Motion via
      global CSS backstop.
- [x] Semantic landmarks: single `<main id="main">`, header/nav/footer
      elements, `aria-label` on `<nav>`.
- [x] Alt text on all decorative images set to empty string or descriptive
      copy sourced from the dictionary.

**Manual**

- [ ] Keyboard-only tour: Tab through home → services → booking wizard,
      submit a booking with Enter, cancel with Escape (mobile nav).
- [ ] Screen reader (VoiceOver / NVDA): the language toggle announces its
      state, form errors are announced via `role="alert"`, success via
      `role="status"`.
- [ ] Turn on "Reduce Motion" in OS settings → hero and reveal animations
      complete instantly.

## 6. Error + empty states (Phase 9)

- [x] `/[locale]/not-found.tsx` renders localized copy with home + services
      links.
- [x] `/[locale]/error.tsx` renders the fallback with retry button and
      reference code (`digest`).
- [x] `/global-error.tsx` renders even when the root layout throws — no
      dependency on i18n, fonts, or Supabase.
- [x] `/[locale]/loading.tsx` shows a subtle brass progress bar during
      navigation.
- [x] Booking wizard shows a `notConfiguredTitle` state when Supabase env
      is missing (verified in `src/app/[locale]/prenota/page.tsx`).

## 7. Data layer sanity

- [x] Appointments query (with `profiles` join) returns in <200 ms as
      admin, verified with `scripts/verify-admin-rls.mjs`.
- [x] Booking insert uses the DB exclusion constraint
      (`appointments_no_overlap`) as the source of truth for overlap
      prevention — the UI slot filter is a UX nicety, not a security
      boundary.
- [x] `revalidatePath` fires after every admin mutation so admin lists
      reflect immediately.

---

## Deploy prerequisites

1. Set `NEXT_PUBLIC_SITE_URL` to the production URL (e.g.
   `https://doctorcuts.it`) so metadata, sitemap, and email links are
   absolute.
2. Ensure Supabase project has these migrations applied (in order):
   `00000000000001_extensions_and_enums.sql` → `…06_is_admin_definer.sql`.
3. Set `SEED_ADMIN_EMAIL` and run `npm run seed:admin -- <email>` at least
   once so at least one user has role=admin.
4. Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g.
   `bookings@mail.doctorcuts.it`) — without these, booking confirmation
   emails only log to the server console.
5. For horizontally-scaled deploys, swap the in-memory rate limiter for a
   Redis or Supabase-backed backend (see comment in
   `src/lib/security/rate-limit.ts`). Current implementation is per-instance
   and resets on process restart.
