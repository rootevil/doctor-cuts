-- Allow studio to pause online bookings without wiping settings.
alter table public.settings
  add column if not exists bookings_enabled boolean not null default true;

comment on column public.settings.bookings_enabled is
  'When false, customers cannot create online bookings (admin can still manage appointments).';
