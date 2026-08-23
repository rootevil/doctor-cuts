-- Doctor Cuts — Row Level Security.
-- Deny-by-default: enable RLS on every public table, then declare explicit
-- policies. Admin access is checked with a helper function to avoid
-- recursive policy evaluation on profiles.

alter table public.profiles      enable row level security;
alter table public.services      enable row level security;
alter table public.appointments  enable row level security;
alter table public.business_hours enable row level security;
alter table public.breaks        enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.reviews       enable row level security;
alter table public.gallery       enable row level security;
alter table public.settings      enable row level security;

-- Force RLS even for table owners hitting the API. Service-role bypasses RLS
-- entirely, which is why the service key MUST stay server-only.
alter table public.profiles      force row level security;
alter table public.appointments  force row level security;

-- Admin check: not `security definer` on purpose — evaluated as the caller.
-- Reading own profile row is permitted by the "profiles read own" policy,
-- so this returns true only when the caller *is* an admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Profiles ---------------------------------------------------------------
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = 'customer');
-- Customers cannot self-promote to admin; admins bypass via the admin policy below.

drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Services ---------------------------------------------------------------
drop policy if exists "services public read active" on public.services;
create policy "services public read active"
  on public.services for select
  using (is_active or public.is_admin());

drop policy if exists "services admin write" on public.services;
create policy "services admin write"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

-- Appointments -----------------------------------------------------------
drop policy if exists "appointments select own" on public.appointments;
create policy "appointments select own"
  on public.appointments for select
  using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "appointments insert own" on public.appointments;
create policy "appointments insert own"
  on public.appointments for insert
  with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "appointments update own or admin" on public.appointments;
create policy "appointments update own or admin"
  on public.appointments for update
  using (customer_id = auth.uid() or public.is_admin())
  with check (customer_id = auth.uid() or public.is_admin());

drop policy if exists "appointments delete admin" on public.appointments;
create policy "appointments delete admin"
  on public.appointments for delete
  using (public.is_admin());

-- Business hours + breaks + blocked dates: public read, admin write.
drop policy if exists "business_hours public read" on public.business_hours;
create policy "business_hours public read"
  on public.business_hours for select using (true);
drop policy if exists "business_hours admin write" on public.business_hours;
create policy "business_hours admin write"
  on public.business_hours for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "breaks public read" on public.breaks;
create policy "breaks public read" on public.breaks for select using (true);
drop policy if exists "breaks admin write" on public.breaks;
create policy "breaks admin write"
  on public.breaks for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blocked_dates public read" on public.blocked_dates;
create policy "blocked_dates public read" on public.blocked_dates for select using (true);
drop policy if exists "blocked_dates admin write" on public.blocked_dates;
create policy "blocked_dates admin write"
  on public.blocked_dates for all
  using (public.is_admin()) with check (public.is_admin());

-- Reviews ----------------------------------------------------------------
drop policy if exists "reviews public read approved" on public.reviews;
create policy "reviews public read approved"
  on public.reviews for select
  using (status = 'approved' or customer_id = auth.uid() or public.is_admin());

drop policy if exists "reviews insert own" on public.reviews;
create policy "reviews insert own"
  on public.reviews for insert
  with check (customer_id = auth.uid());

drop policy if exists "reviews admin moderate" on public.reviews;
create policy "reviews admin moderate"
  on public.reviews for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews admin delete" on public.reviews;
create policy "reviews admin delete"
  on public.reviews for delete using (public.is_admin());

-- Gallery ----------------------------------------------------------------
drop policy if exists "gallery public read" on public.gallery;
create policy "gallery public read" on public.gallery for select using (true);
drop policy if exists "gallery admin write" on public.gallery;
create policy "gallery admin write"
  on public.gallery for all
  using (public.is_admin()) with check (public.is_admin());

-- Settings ---------------------------------------------------------------
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write"
  on public.settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Storage: buckets are created in the seed. Object policies:
-- public read for gallery/services/avatars; authenticated write with admin
-- gate on the gallery and services buckets, own-avatar gate on avatars.
drop policy if exists "storage public read" on storage.objects;
create policy "storage public read"
  on storage.objects for select
  using (bucket_id in ('gallery', 'services', 'avatars'));

drop policy if exists "storage admin write gallery/services" on storage.objects;
create policy "storage admin write gallery/services"
  on storage.objects for all
  to authenticated
  using (
    bucket_id in ('gallery', 'services') and public.is_admin()
  )
  with check (
    bucket_id in ('gallery', 'services') and public.is_admin()
  );

drop policy if exists "storage own avatar" on storage.objects;
create policy "storage own avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
