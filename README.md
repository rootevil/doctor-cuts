# Doctor Cuts

Premium single-location barbershop site + booking platform for **Doctor Cuts**, Via Antelmo Severini, 4/C, 62100 Macerata (IT).

Spec: [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md). Build one phase at a time; do not start Phase *n+1* if Phase *n* is broken.

## Stack

Next.js 16 (App Router, TypeScript strict) · Tailwind v4 · Framer Motion (restrained) · Lucide · Supabase (Postgres, Auth, Storage) via `@supabase/supabase-js` + `@supabase/ssr`.

## Run

```bash
npm install
cp .env.local.example .env.local   # optional until Phase 3+
npm run dev                        # http://localhost:3000
```

The homepage, `/servizi`, `/servizi/[slug]`, `/galleria`, `/storia`, `/contatti`, and the `/prenota` stub work without Supabase configured. `/accedi`, `/registrati`, `/account`, and `/admin` require a Supabase project (see below).

## Locales

`/it` (default) and `/en`. Path segments are Italian canonicals (`/servizi`, `/galleria`, etc.); the language toggle in the header swaps the current URL's locale segment. `NEXT_LOCALE` cookie + `Accept-Language` are respected on first visit.

## Supabase

Choose one of two paths; both use the same migrations, seed, and env variable names.

### Local (recommended for development)

Requires Docker Desktop running.

```bash
npm run supabase:start     # boots Postgres + Studio at :54321-54324
npm run supabase:status    # shows the anon + service-role keys to copy into .env.local
npm run supabase:reset     # re-applies all migrations and re-seeds
```

`.env.local` for local dev:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from `supabase status`>
SUPABASE_SERVICE_ROLE_KEY=<from `supabase status`>
SEED_ADMIN_EMAIL=admin@dr-cuts.com
```

### Cloud (Supabase.com free tier)

1. Create a project.
2. Link this repo: `npx supabase link --project-ref <ref>`.
3. Push migrations: `npx supabase db push`.
4. Copy Project URL, `anon` key, and `service_role` key from Project Settings → API into `.env.local`.
5. Sign up as `admin@dr-cuts.com` (or sign in if already registered). That mailbox is the only one promoted to `role = 'admin'`. Other signups stay customers.

### Admin bootstrap

Admin access is hardcoded to `admin@dr-cuts.com` (see `site.emails.admin`). Sign-in / sign-up syncs `profiles.role` to match. To recover a stuck profile: `npm run seed:admin -- admin@dr-cuts.com`.

## Database

Idempotent migrations live under `supabase/migrations/`:

1. Extensions (`pgcrypto`, `btree_gist`, `citext`) and enums (`user_role`, `appointment_status`, `review_status`)
2. Tables: `profiles`, `services`, `appointments`, `business_hours`, `breaks`, `blocked_dates`, `reviews`, `gallery`, `settings`. Appointments have an `EXCLUDE USING gist` constraint that prevents double-booking at the DB level for blocking statuses (`pending | confirmed | arrived`).
3. Triggers: `updated_at`, `handle_new_user` (mirrors `auth.users` into `profiles`), and a booking `reference_code` generator (`DC-XXXX`).
4. RLS: enabled on every public table; policies for public read (services active, gallery, approved reviews, hours, settings), customer CRUD on own rows, and admin all-access via an `is_admin()` helper.
5. Storage buckets: `gallery`, `services`, `avatars` (public read; admin write to gallery/services; own-folder write to avatars).

`supabase/seed.sql` seeds the settings singleton, Mon–Sun opening hours (Mon–Sat 10–21, Sun 12–18), the four services (Signature Cut, Skin Fade, Beard Sculpt, Full Experience), and the gallery entries mirroring `public/images`.

## Security

- Service-role key is server-only. `src/lib/supabase/admin.ts` is marked `"server-only"`; do not import from client modules.
- RLS is `force`d on `profiles` and `appointments` so even table owners hitting the API go through policies.
- `middleware.ts` refreshes the Supabase session on every navigation, redirects unauthenticated requests to `/accedi` for `/account*`, and redirects non-admins away from `/admin*`.

## Scripts

- `npm run dev` — Next dev server
- `npm run build` / `npm run start` — production
- `npm run lint` — ESLint (Next 16 rules)
- `npm run typecheck` — `tsc --noEmit`
- `npm run supabase:*` — CLI passthrough (start, stop, status, reset)
- `npm run seed:admin -- <email>` — promote a signed-up user to admin

## Layout

```
src/
  app/[locale]/         # routes (both it and en)
  components/           # layout, hero, services, gallery, auth, ...
  i18n/                 # locale config, dictionaries, cookie
  lib/
    routes.ts           # canonical route helpers
    site.ts             # canonical business data
    supabase/           # env, browser, server, admin, middleware
    auth/               # server actions
supabase/
  config.toml
  migrations/*.sql
  seed.sql
```
