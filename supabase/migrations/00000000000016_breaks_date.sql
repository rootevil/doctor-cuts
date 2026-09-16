-- One-off breaks on a specific calendar date (in addition to weekday / every-day).
-- When `date` is set, `day_of_week` must be null; recurring breaks keep `date` null.

alter table public.breaks
  add column if not exists date date;

alter table public.breaks
  drop constraint if exists breaks_day_or_date;

alter table public.breaks
  add constraint breaks_day_or_date check (
    date is null or day_of_week is null
  );

create index if not exists breaks_date_idx on public.breaks (date);

comment on column public.breaks.date is
  'When set, this break applies only on that shop-local date (day_of_week must be null).';
