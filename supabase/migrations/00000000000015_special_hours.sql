-- Custom open/close hours for a single calendar date (overrides weekly schedule).
create table if not exists public.special_hours (
  id         uuid primary key default gen_random_uuid(),
  date       date not null unique,
  open_time  time,
  close_time time,
  is_closed  boolean not null default false,
  label      text,
  constraint special_hours_times_when_open check (
    is_closed
    or (
      open_time is not null
      and close_time is not null
      and close_time > open_time
    )
  )
);

create index if not exists special_hours_date_idx on public.special_hours (date);

alter table public.special_hours enable row level security;

drop policy if exists "special_hours public read" on public.special_hours;
create policy "special_hours public read"
  on public.special_hours for select using (true);

drop policy if exists "special_hours admin write" on public.special_hours;
create policy "special_hours admin write"
  on public.special_hours for all
  using (public.is_admin()) with check (public.is_admin());
