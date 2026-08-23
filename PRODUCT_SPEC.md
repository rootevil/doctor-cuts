# Doctor Cuts — Product Specification

**Version:** 1.0  
**Date:** 22 August 2026  
**Quality bar:** Professionally commissioned custom site (~€5,000 / $5,000), not a template.  
**Status:** Specification only. Do not implement the entire application in one pass.

This document is the source of truth for brand, UX, pages, components, data, booking, admin, motion, responsiveness, performance, security, and acceptance criteria.

---

## 0. How to use this document

Build in the phases in **§36**. Do not start Phase *n+1* if Phase *n* is broken.

At the end of every phase:

1. `npm run dev` — app runs at `http://localhost:3000`
2. TypeScript clean
3. Lint clean
4. Existing routes still work
5. Mobile, tablet, desktop checked for that phase’s surfaces

Hand this file to the coding agent **one phase at a time**, plus the relevant sections below. The master implementation prompt is **§37**.

**Photography is not optional polish.** A technically perfect Next.js app with generic stock photos will not meet this quality bar. Structure the app so images are CMS-replaceable (Supabase Storage + gallery/services tables). Until real shop photos exist, use **tasteful, dark, high-contrast placeholders** (local `/public` or Storage), never random Unsplash “happy barber” tropes.

---

## 1. Product concept

| Field | Value |
| --- | --- |
| Brand | **Doctor Cuts** |
| Working internal codename | (retired) NOIR — do not use in UI, metadata, booking IDs, or copy |
| Type | Premium **single-location** barbershop website + booking platform |
| Location | Via Antelmo Severini, 4/C · 62100 Macerata, Italy |
| Phone | 348 174 8052 (display); E.164 `+393481748052` |
| Instagram | [instagram.com/dr_barbiere](https://www.instagram.com/dr_barbiere/) |
| Target | Modern / luxury men’s grooming; local Macerata + surrounding Marche |
| Staff model | **No individual barber accounts** in v1. Customer books a **service at the shop**. |
| Goal | Booking should feel like reserving a premium experience, not filling a generic form. |

### Core philosophy

Editorial luxury + brutalist minimalism + cinematic photography + extremely fast UX.

Closer to a fashion / grooming house than a “barber WordPress theme.”

### Explicitly forbidden

- Generic barber templates, clip-art razors, gold-everywhere, casino/gaming look
- Huge rounded card grids, cheesy bounce animations, cluttered dashboards
- Stock-photo energy, lorem ipsum, obvious AI filler copy
- Fake availability calculated only on the client
- Exposing admin data or the Supabase service-role key to the browser

### Language & locale (v1)

- **Default locale:** Italian (`it`)
- **Timezone:** `Europe/Rome`
- **Currency:** EUR (`€`), formatted `it-IT` (e.g. `€ 25`)
- **Brand lines** (hero, statements) may stay in **English** for editorial effect; **functional UI** (booking, forms, errors, admin, legal microcopy) in Italian.
- **v1.1 (optional):** `it` / `en` locale switch. Do not block v1 on i18n infrastructure.

---

## 2. Tech stack

### Frontend

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui **only** for functional primitives (dialog, sheet, dropdown, form controls) — restyle to brand; do not ship default “shadcn look”
- Framer Motion **only** for selected motion; respect `prefers-reduced-motion`
- Lucide icons (stroke, sparse)

### Backend

- Supabase: PostgreSQL, Auth, Storage
- Server-side booking mutations via Next.js Server Actions / Route Handlers using the **user session** or **server-only** service role (never in client bundles)

### Development

- Everything local first: `npm run dev` → `http://localhost:3000`
- No domain, hosting, or paid APIs required for v1
- Maps: **do not load** Google/Mapbox on first paint. Link “Indicazioni” to Apple/Google Maps URL, or lazy-load an embed **after** user intent

### Production (after the product is finished)

- Vercel (or equivalent) + Supabase project
- Out of scope until Phase 10 QA is green

### Dependency policy

Do not add libraries because they are popular. No extra animation kits, no heavy date-picker suites if a small custom calendar suffices, no full calendar SaaS, no WordPress, no Firebase.

---

## 3. Brand direction

### Visual style

**Dark luxury.** Near-black canvas, warm ivory type, charcoal surfaces, hairline borders. One restrained accent **only if needed** (suggested: warm bone/ivory hover, or a single muted brass `#C4B6A6` used for underlines and focus rings — never gold gradients).

| Token | Hex | Tailwind suggestion | Use |
| --- | --- | --- | --- |
| Near black | `#090909` | `bg-background` | Page background |
| Warm ivory | `#F2EFE8` | `text-foreground` | Primary type on dark |
| Charcoal | `#171717` | `bg-surface` | Nav, footer, admin chrome |
| Muted gray | `#858585` | `text-muted` | Captions, meta |
| Border | `#292929` | `border-border` | Hairlines |
| Ivory inverse | `#F2EFE8` bg / `#090909` text | CTAs, booking success | High-contrast actions |

Contrast: ivory on near-black and black on ivory must meet WCAG AA for body and buttons.

### Typography

**Display (headlines):** Instrument Serif *or* Cormorant Garamond *or* Playfair Display. Pick **one** and stay with it.

**UI / body:** Geist *or* Inter *or* Manrope. Pick **one**.

Rules:

- Large editorial headlines, tight leading, line breaks as design
- All-caps tracking for kicker labels (`EST. 2026`, `SERVIZI`, `01`)
- Body 16–18px, generous measure, lots of empty space
- Preload only the weights actually used (likely display italic/regular + body 400/500)

Example display treatment:

```
TAGLIO
CON
INTENZIONE.
```

### Voice

Confident, short, specific. No “Benvenuti nel nostro barbershop.” No fake awards. Name the place, the street, the craft.

---

## 4. Information architecture & navigation

### Public routes

| Path | Purpose |
| --- | --- |
| `/` | Homepage (strongest page) |
| `/servizi` | All services |
| `/servizi/[slug]` | Service detail + book CTA |
| `/galleria` | Gallery |
| `/storia` | About / philosophy (`/about` alias redirect OK) |
| `/contatti` | Contact / hours / map intent |
| `/prenota` | Booking flow (`/book` alias redirect OK) |
| `/account` | Customer hub |
| `/account/appuntamenti` | Appointment list |
| `/accedi`, `/registrati` | Auth |
| `/admin/*` | Admin (protected) |

English path aliases may redirect to Italian canonicals for SEO.

### Desktop nav

```
DOCTOR CUTS                    SERVIZI   GALLERIA   STORIA   CONTATTI   PRENOTA
```

Logo left. Primary links center-right. **Prenota** is a distinct text button (ivory border or inverted pill — not a chubby rounded SaaS button).

**On scroll:**

- Nav background → translucent charcoal (`bg-[#171717]/70` or similar)
- `backdrop-blur` modest (8–12px)
- Hairline bottom border appears
- Logo remains visible
- Height may compress slightly

### Mobile nav

```
DOCTOR CUTS                         MENU
```

Menu opens **full-screen** (near black), large type, no hamburger-drawer clutter:

```
SERVIZI
PRENOTA
STORIA
GALLERIA
CONTATTI
────────────────
INSTAGRAM
WHATSAPP
```

Focus trap, Escape to close, restore focus to MENU. `aria-expanded` on the control.

---

## 5. Homepage — hero

Full viewport (`min-h-dvh`). Background: one optimized cinematic still (preferred) or a **short** muted video on desktop only.

**Do not autoplay large video on mobile.** Poster image only.

Overlay content (left or slight offset — not dead-center template):

```
EST. 2026
L’ARTE
DEL
TAGLIO.
Precisione e cura
per l’uomo contemporaneo.
[ PRENOTA ]
```

English editorial alternative (allowed if photography is strong):

```
EST. 2026
THE ART
OF THE
CUT.
```

Add `SCROLL TO EXPLORE` / `SCOPRI` with a quiet down cue.

**Motion (if motion allowed):**

- Background image scale `1.05 → 1` slowly (~1.2s, ease-out)
- Headline reveals **line by line**
- CTA fades/slides up ~8–12px
- No ken-burns loops, no parallax storms

---

## 6. Homepage — brand statement

Massive type, empty space, no card.

```
NON SOLO
UN TAGLIO.
UN LUOGO
PER FERMARSI.
```

Supporting paragraph (~20 words):

> Tagli precisi, dettagli considerati, un’esperienza costruita intorno a te.

---

## 7. Homepage — services (editorial list)

Not Bootstrap cards.

```
SERVIZI
01   SIGNATURE CUT              € 25
     Taglio classico di precisione
     45 MIN
02   SKIN FADE                  € 30
     Fade pulito + styling
     50 MIN
03   BEARD SCULPT               € 18
     Barba definita
     30 MIN
04   THE FULL EXPERIENCE        € 45
     Taglio + barba + styling
     75 MIN
```

**Prices above are seed defaults** — admin-editable. Do not hardcode after Phase 3.

**Desktop hover:**

- Row expands slightly (padding / hairline)
- Number shifts
- Service image follows cursor (small editorial still, ~180–240px, `pointer-events: none`)
- Arrow animates right
- Reduced-motion: no cursor-follow; static expand OK

**Mobile:** accordion / stacked list; tap expands description + duration + Prenota.

CTA: `TUTTI I SERVIZI →` → `/servizi`

---

## 8. Homepage — booking visual break

Full-bleed image, oversized type:

```
IL TUO PROSSIMO
MIGLIOR LOOK
INIZIA QUI.
[ PRENOTA ]
```

---

## 9. Homepage / `/galleria` — gallery

Editorial masonry (CSS columns or a simple packed grid — **not** a heavy masonry library).

Filters: `TUTTI · TAGLI · FADE · BARBA · STYLE · STUDIO`

**Hover (desktop):** slight zoom, dark overlay, title, arrow.

**Click:** accessible full-screen lightbox (focus trap, arrows, Escape, swipe on mobile).

`next/image`, explicit `sizes`, AVIF/WebP where possible.

---

## 10. Homepage — the experience

Four blocks, alternating image / text:

| N | Title | Line |
| --- | --- | --- |
| 01 | ARRIVO | Il rumore resta fuori. |
| 02 | PAUSA | Siediti. Rallenta. |
| 03 | CRAFT | Precisione in ogni dettaglio. |
| 04 | USCITA | Esci diverso. |

---

## 11. About (`/storia`)

Story, not brochure.

```
COSTRUITO INTORNO
AL BUON GUSTO.
Doctor Cuts esiste per chi
nota i dettagli.
```

Must include: shop/interior photography slots, philosophy, opening year (2026 unless real history is supplied), **Via Antelmo Severini, 4/C, Macerata**.

---

## 12. Testimonials

3–5 reviews only. Large quote, name, five stars. Featured reviews come from CMS (`reviews.is_featured` + approved).

Seed example:

> “Il miglior taglio che abbia fatto da anni.”  
> — Nome italiano credibile · ★★★★★

Do not invent a wall of fake Google reviews in the UI.

---

## 13. Location

```
TROVACI
Via Antelmo Severini, 4/C
62100 Macerata, Italia
LUN — SAB
10:00 — 21:00
DOM
12:00 — 18:00
[ INDICAZIONI ]
```

Hours are **settings-driven** after Phase 3; these are seed defaults.

**Indicazioni:** `https://www.google.com/maps/search/?api=1&query=Via+Antelmo+Severini+4/C+62100+Macerata`

Optional embed only after click (“Mostra mappa”).

WhatsApp deep link: `https://wa.me/393481748052`

Tel: `tel:+393481748052`

---

## 14. Footer

```
DOCTOR CUTS
Instagram  ·  WhatsApp  ·  Telefono
Servizi · Storia · Galleria · Contatti · Prenota
Via Antelmo Severini, 4/C · 62100 Macerata
© 2026 Doctor Cuts
```

No Facebook unless a real URL is provided later.

---

## 15. Booking UX (`/prenota`)

Multi-step, one column, generous type, progress:

`01 SERVIZIO — 02 DATA — 03 ORARIO — 04 DATI — 05 CONFERMA`

### Step 1 — Service

Active services from DB: name, description, price, duration, optional image.

### Step 2 — Date

Horizontal week scroller (not a bulky month widget as the primary control). Month overview allowed as secondary.

Only dates inside `[today + booking_notice_hours, today + max_booking_days]`, excluding closed weekdays and `blocked_dates`.

### Step 3 — Times

Slots generated **on the server** (see §16). Unavailable = disabled, not hidden without explanation. If none: “Nessun orario disponibile. Prova un altro giorno.”

### Step 4 — Details

Name, phone, email, notes. If logged in, prefill from `profiles`. Guest booking allowed **or** require account — **v1 decision: guest + optional account**. If guest, still create/link a profile by email.

### Step 5 — Confirmation

```
SEI PRENOTATO.
SIGNATURE CUT
Sabato 29 agosto
17:30
Doctor Cuts
Via Antelmo Severini, 4/C, Macerata
[ AGGIUNGI AL CALENDARIO ]
Prenotazione #DC-4821
```

ICS download + `BACK TO HOME`. Subtle check motion.

Sticky mobile bar on `/servizi` and service detail: service + price + PRENOTA.

---

## 16. Booking logic (authoritative)

Availability is **never** trusted from the client. The insert path must re-check in the same transaction as the write.

### Slot generation inputs

- `business_hours` for that `day_of_week` (`is_closed` → no slots)
- `breaks` (lunch / closing gaps)
- `blocked_dates` (full day)
- Service `duration_minutes`
- Existing appointments whose status ∈ `PENDING | CONFIRMED | ARRIVED` (completed/cancelled/no-show do **not** block)
- `settings.booking_notice_hours` (minimum notice)
- `settings.max_booking_days`
- Slot interval: **15 minutes** (configurable in settings later; v1 fixed 15)

### Collision example

Shop 10:00–21:00, service 45 min, existing 17:00–17:45 → **17:00 is not offered**. Also reject 16:30 if it would overlap 17:00–17:45. Last start = close − duration (and not colliding with breaks).

### Double-booking protection (required)

PostgreSQL **exclusion constraint** (or equivalent) on `appointments` using `tstzrange` / `tsrange` for overlapping times on the same shop calendar, **filtered to blocking statuses**.

If two requests race, one must fail with a clean “orario non più disponibile.”

### Other rules

| Rule | Source |
| --- | --- |
| Min notice | `settings.booking_notice_hours` (seed: 2) |
| Max horizon | `settings.max_booking_days` (seed: 30) |
| Cancel until | `settings.cancellation_hours` before start (seed: 12) |
| Reschedule | Same as new booking + cancel window |
| Timezone | Store `timestamptz`; display Rome |

### Statuses

`PENDING | CONFIRMED | ARRIVED | COMPLETED | CANCELLED | NO_SHOW`

v1: new bookings enter `CONFIRMED` (single-shop, no staff approval bottleneck) **or** `PENDING` if admin enables “require confirmation” in settings. Seed: **CONFIRMED**.

---

## 17. Customer account (`/account`)

```
ACCOUNT
Ciao, Ali.
PROSSIMO APPUNTAMENTO
Signature Cut · Sabato · 17:30
[ DETTAGLI ]
────────────────
PASSATI
12 ago  · Signature Cut
15 lug  · Skin Fade
```

Features: upcoming, past, cancel (if inside window), reschedule, rebook, profile (name, phone, email), saved notes/preferences (simple fields — favorite service optional).

Customers see **only their** rows (RLS).

---

## 18–26. Admin (`/admin`)

Premium quiet SaaS: charcoal, ivory type, no purple gradients, no 12-column widget vomit.

**Sidebar:** Overview · Appuntamenti · Calendario · Clienti · Servizi · Galleria · Recensioni · Impostazioni · Esci

### Overview

Greeting + date. Stats: today’s count, today’s revenue (completed + confirmed that day — define in code comments), completed, upcoming.

Today’s schedule list. Minimalist revenue chart (last 14 days). Popular services %.

### Appointments

View, confirm, cancel, reschedule, arrived, completed, no-show. Detail **drawer**. Tasteful status badges (hairline + muted color, not candy).

### Calendar

Day / week / month. Blocks: time, name, service, duration. Click → drawer.

### Customers

Search. Profile: visits, spend, last visit, favorite service, phone, history.

### Services

CRUD, price, duration, image (Storage), active toggle, `sort_order` (drag-and-drop).

### Hours & blocks

Mon–Sun open/close/closed. Breaks. Holidays / blocked dates with reason.

### Gallery admin

Upload, title, category, description, featured, drag order. Images optimized on upload (max dimension + WebP) if feasible; otherwise document manual export rules (max 2000px, compressed).

### Reviews

Approve, reject, feature, delete. Only approved + featured on homepage.

---

## 27. Authentication & authorization

| Role | Access |
| --- | --- |
| `customer` | Public + `/account` |
| `admin` | `/admin/*` + admin RLS |

- Email/password; optional magic link for customers
- Admin: password (and optionally magic link). Seed **one** admin via migration/env — never a public “register as admin”
- Middleware: unauthenticated `/admin` → login; `customer` hitting `/admin` → 404 or 403 (do not leak that admin exists via distinct copy if possible)
- Never send service-role key to the client
- RLS on all tables (see §28)

---

## 28. Database

UUID PKs, `timestamptz` defaults, FKs, indexes.

### `profiles`

`id` (FK `auth.users`) · `full_name` · `email` · `phone` · `avatar_url` · `role` (`customer` \| `admin`) · `created_at` · `updated_at`

### `services`

`id` · `slug` unique · `name` · `description` · `price` numeric(10,2) · `duration_minutes` int check > 0 · `image_url` · `is_active` · `sort_order` · `created_at`

### `appointments`

`id` · `customer_id` → profiles · `service_id` → services · `starts_at` timestamptz · `ends_at` timestamptz · `status` · `customer_notes` · `admin_notes` · `reference_code` unique (e.g. `DC-4821`) · `created_at` · `updated_at`

Prefer **`starts_at` / `ends_at`** over split date+time columns to make exclusion constraints and timezone correct. If date/time columns are used, they must still map to a single Rome-local range and be constrained.

Check: `ends_at > starts_at`.

### `business_hours`

`id` · `day_of_week` 0–6 (Monday=1 or ISO — **document in SQL**) · `open_time` · `close_time` · `is_closed`

### `breaks`

`id` · `day_of_week` nullable (null = every open day) · `start_time` · `end_time` · `label`

### `blocked_dates`

`id` · `date` · `reason`

### `reviews`

`id` · `customer_id` · `appointment_id` unique · `rating` 1–5 · `comment` · `status` (`pending` \| `approved` \| `rejected`) · `is_featured` · `created_at`

### `gallery`

`id` · `image_url` · `title` · `category` · `description` · `sort_order` · `is_featured` · `created_at`

### `settings`

Singleton row: `business_name` (`Doctor Cuts`) · `address` · `phone` · `email` · `instagram` · `whatsapp` · `booking_notice_hours` · `max_booking_days` · `cancellation_hours` · `require_confirmation` boolean · `slot_interval_minutes`

### RLS sketch

- `services`, `gallery` (featured/active): public read
- `reviews`: public read where approved
- `settings`: public read of non-secret fields
- `appointments`: customer CRUD own (insert/update limited); admin all
- `profiles`: own read/update; admin read all
- Writes to catalog, hours, gallery, reviews moderation: **admin only**

Storage buckets: `gallery`, `services`, `avatars` — public read for published assets; authenticated upload with size/MIME checks.

---

## 29. Components (build these; do not dump page-sized files)

```
src/
  app/                 # routes only, compose
  components/
    layout/            # SiteHeader, SiteFooter, MobileNav, PageTransition
    hero/              # HomeHero
    services/          # ServiceList, ServiceRow, ServiceAccordion
    gallery/           # GalleryGrid, GalleryFilters, Lightbox
    booking/           # Stepper, ServicePicker, DateStrip, TimeGrid, DetailsForm, Confirmation
    testimonials/
    location/
    account/
    admin/             # Shell, StatRow, AppointmentDrawer, Calendar, charts
    forms/
    ui/                # shadcn restyled
  lib/
    supabase/          # browser client, server client, admin/server-only
    booking/           # slots, collisions, reference codes, ics
    validation/        # zod
    seo/
    utils/
  types/
  styles/
```

---

## 30. Motion

Restraint. If in doubt, don’t.

| Surface | Behavior |
| --- | --- |
| Page change | Short fade (~200ms) |
| Hero | Line reveal + image settle |
| Images | Hover scale ~1.04 |
| Buttons | Arrow translate ~4px |
| Service rows | Cursor preview desktop only |
| Nav | Blur on scroll |
| Booking success | Small check |
| Custom cursor | Optional desktop only; **never** on touch |

`prefers-reduced-motion: reduce` → no scale loops, no cursor-follow, instant opacity.

---

## 31. Responsive strategy

Do not scale the desktop layout down.

| Break | Intent |
| --- | --- |
| < 768 | Full-screen menu, accordion services, sticky book bar, single-column editorial, no custom cursor, no hover-only info |
| 768–1023 | Simplified two-column where it helps |
| 1024–1439 | Full editorial + service hover |
| ≥ 1440 | Max content width ~1440–1600; do not stretch type across 4K |

Touch targets ≥ 44px on booking slots and nav.

---

## 32. Performance

**Target:** Lighthouse Performance **90+** on mobile homepage; good LCP / INP / CLS.

- Server Components by default; Client Components only for interactivity
- `next/image`; `sizes` correct for masonry vs hero
- Preload **hero image** + critical fonts only; `font-display: swap`
- No map / analytics on load
- No autoplay video on mobile
- Dynamic import lightbox, admin charts, calendar
- Optimize uploads
- Minimal JS; Framer Motion not on static paragraphs

---

## 33. SEO

- Metadata, OG, Twitter, canonical per page
- `sitemap.ts`, `robots.ts`
- JSON-LD `LocalBusiness` / `BarberShop`: name Doctor Cuts, address Macerata, phone, instagram, geo when known, opening hours from settings
- `Service` schema on `/servizi/[slug]`
- Language `it`

---

## 34. Accessibility

Keyboard nav, labels, semantic landmarks, visible focus (ivory ring), accessible dialogs, AA contrast, reduced motion, alt text, form errors tied with `aria-describedby`. Lightbox is a modal dialog.

---

## 35. Security

- Zod (or equivalent) on **server** for all mutations
- RLS always on
- Re-check availability in DB transaction before insert
- Sanitize review/comment HTML (plain text only)
- Rate-limit auth and booking POST (middleware or Supabase)
- Admin middleware + RLS (defense in depth)
- No PII in client logs

---

## 36. Build phases (mandatory)

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| **1** | Design tokens, fonts, layout chrome, **homepage** with placeholder images | Looks premium; responsive; no booking backend |
| **2** | `/servizi`, `[slug]`, `/galleria`, `/storia`, `/contatti` | All public IA live |
| **3** | Supabase schema, seed, Auth, RLS, Storage | Login works; seed services; admin user in env |
| **4** | Booking engine + `/prenota` | Double-book impossible; slots match hours |
| **5** | Customer `/account` | Cancel/reschedule/rebook rules |
| **6** | Admin dashboard (all §18–26) | CRUD hours, services, gallery, reviews |
| **7** | Security pass, validation, rate limits | RLS tested as customer vs admin |
| **8** | Performance + SEO | Lighthouse, metadata, JSON-LD |
| **9** | Mobile polish, sticky bar, nav, booking | Thumb-reachable, no hover-only traps |
| **10** | QA (see §38) | Sign-off list green |

Recommended sequence reminder: **design → homepage → booking → database → admin → polish → performance → deploy.**

---

## 37. Master prompt (paste per phase)

Use this as the system preamble, then append **only the current phase**.

> You are a senior product designer, senior Next.js engineer, and database architect. Build Doctor Cuts — a premium single-location barbershop site for **Via Antelmo Severini, 4/C, 62100 Macerata, Italy**. Phone **348 174 8052**, Instagram **https://www.instagram.com/dr_barbiere/**. Never use the placeholder name NOIR. Stack: Next.js App Router, TypeScript strict, Tailwind, shadcn primitives only, Framer Motion sparingly, Supabase, Lucide. Quality bar: custom $5,000 fashion-editorial site, not a template. Follow `/PRODUCT_SPEC.md` as source of truth. Server Components by default. Booking availability is computed and locked server/DB-side. Italian UI copy; editorial English headlines allowed. Currency EUR, timezone Europe/Rome. Do not add unnecessary dependencies. Run locally at localhost:3000. After this phase: typecheck, lint, fix, do not start the next phase.

Then: “Implement **Phase N** only: …” plus the phase row from §36.

---

## 38. Acceptance criteria

### Brand & UX

- [ ] Word “NOIR” does not appear in UI, metadata, or booking references
- [ ] Identity reads dark luxury, not gold-casino or generic barber theme
- [ ] Homepage is the strongest page; hero is full viewport
- [ ] Copy is specific (Macerata, street, craft) — no lorem
- [ ] Images are slotted for real photography (Storage or `/public` with clear filenames)

### Pages

- [ ] All routes in §4 exist (or redirects)
- [ ] Nav scroll treatment + full-screen mobile menu
- [ ] Services editorial list + hover (desktop) / accordion (mobile)
- [ ] Gallery filters + accessible lightbox
- [ ] Location uses real address; map not on initial JS budget

### Booking

- [ ] Five-step flow with progress
- [ ] Slots respect hours, duration, breaks, blocks, notice, horizon
- [ ] Overlap insert fails safely; user sees a polished error
- [ ] Confirmation shows service, Rome-local date/time, address, `#DC-xxxx`
- [ ] ICS works
- [ ] Guest or auth path documented and tested

### Account & admin

- [ ] Customer sees only own appointments; cancel/reschedule rules
- [ ] `/admin` blocked for non-admins
- [ ] Status workflow + calendar views + customer search
- [ ] Services, hours, blocked dates, gallery, reviews editable

### Quality

- [ ] Keyboard + reduced-motion + form labels
- [ ] Lighthouse perf 90+ target on homepage (document if missed and why)
- [ ] LocalBusiness JSON-LD correct
- [ ] No service-role in client bundle (`grep` / build inspect)
- [ ] Mobile sticky book bar on service browsing
- [ ] Loading / empty / error / success states exist (no blank screens)

---

## 39. Seed content (replace with real photos ASAP)

**Business**

- Name: Doctor Cuts  
- Address: Via Antelmo Severini, 4/C, 62100 Macerata, Italy  
- Phone display: 348 174 8052  
- WhatsApp: +39 348 174 8052  
- Instagram: https://www.instagram.com/dr_barbiere/

**Services (editable)**

| Slug | Name | Duration | Price |
| --- | --- | --- | --- |
| signature-cut | Signature Cut | 45 | 25 |
| skin-fade | Skin Fade | 50 | 30 |
| beard-sculpt | Beard Sculpt | 30 | 18 |
| full-experience | The Full Experience | 75 | 45 |

**Hours (editable)**

Mon–Sat 10:00–21:00 · Sun 12:00–18:00 (confirm with the owner before launch).

---

## 40. Out of scope (v1)

- Multi-staff / pick-a-barber
- Payments / deposits
- SMS gateway (WhatsApp link is enough)
- Multi-location
- Blog/journal CMS (nav may omit Journal until real content exists)
- Custom domain / production deploy
- Paid map or review APIs

---

*End of specification. Implement phase by phase. Photography and typography will do more for perceived quality than extra features.*
