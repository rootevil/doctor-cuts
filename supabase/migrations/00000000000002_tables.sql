-- Doctor Cuts — core tables.
-- Timestamps are timestamptz; times of day are `time` and interpreted as Europe/Rome by app code.
-- day_of_week: ISO — Monday = 1, Sunday = 7.

set search_path = public, extensions;

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  email        citext unique not null,
  phone        text,
  avatar_url   text,
  role         public.user_role not null default 'customer',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

create table if not exists public.services (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  description       text,
  price             numeric(10,2) not null check (price >= 0),
  duration_minutes  integer not null check (duration_minutes > 0),
  image_url         text,
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists services_active_sort_idx
  on public.services (is_active, sort_order);

create table if not exists public.appointments (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.profiles(id) on delete cascade,
  service_id      uuid not null references public.services(id) on delete restrict,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          public.appointment_status not null default 'confirmed',
  customer_notes  text,
  admin_notes     text,
  reference_code  text not null unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint appointments_time_range_valid check (ends_at > starts_at)
);

create index if not exists appointments_customer_starts_at_idx
  on public.appointments (customer_id, starts_at desc);
create index if not exists appointments_starts_at_idx
  on public.appointments (starts_at);
create index if not exists appointments_status_idx
  on public.appointments (status);

-- Double-booking guard: only blocking statuses take a slot.
-- Re-checked in the DB, not only in the UI.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'appointments_no_overlap'
  ) then
    alter table public.appointments
      add constraint appointments_no_overlap
      exclude using gist (
        tstzrange(starts_at, ends_at, '[)') with &&
      ) where (status in ('pending', 'confirmed', 'arrived'));
  end if;
end$$;

create table if not exists public.business_hours (
  id            uuid primary key default gen_random_uuid(),
  day_of_week   smallint not null unique check (day_of_week between 1 and 7),
  open_time     time,
  close_time    time,
  is_closed     boolean not null default false,
  constraint business_hours_times_when_open check (
    is_closed or (open_time is not null and close_time is not null and close_time > open_time)
  )
);

create table if not exists public.breaks (
  id            uuid primary key default gen_random_uuid(),
  day_of_week   smallint check (day_of_week between 1 and 7),
  start_time    time not null,
  end_time      time not null,
  label         text,
  constraint breaks_valid_range check (end_time > start_time)
);

create table if not exists public.blocked_dates (
  id      uuid primary key default gen_random_uuid(),
  date    date not null unique,
  reason  text
);

create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid references public.profiles(id) on delete set null,
  appointment_id uuid unique references public.appointments(id) on delete set null,
  rating         smallint not null check (rating between 1 and 5),
  comment        text,
  status         public.review_status not null default 'pending',
  is_featured    boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists reviews_status_featured_idx
  on public.reviews (status, is_featured);

create table if not exists public.gallery (
  id           uuid primary key default gen_random_uuid(),
  image_url    text not null,
  title        text,
  description  text,
  category     text,
  sort_order   integer not null default 0,
  is_featured  boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists gallery_category_sort_idx
  on public.gallery (category, sort_order);

-- Singleton settings row: enforced via a unique boolean.
create table if not exists public.settings (
  id                       uuid primary key default gen_random_uuid(),
  singleton                boolean not null default true unique,
  business_name            text not null,
  address                  text not null,
  phone                    text,
  email                    text,
  instagram                text,
  facebook                 text,
  whatsapp                 text,
  booking_notice_hours     integer not null default 2 check (booking_notice_hours >= 0),
  max_booking_days         integer not null default 30 check (max_booking_days > 0),
  cancellation_hours       integer not null default 12 check (cancellation_hours >= 0),
  require_confirmation     boolean not null default false,
  slot_interval_minutes    integer not null default 15 check (slot_interval_minutes > 0),
  updated_at               timestamptz not null default now(),
  constraint settings_singleton_check check (singleton = true)
);
