-- Curated Google review cards for the public homepage section.
-- Admin pastes real client quotes from Google Maps (no Places API).

alter table public.reviews
  add column if not exists author_name text,
  add column if not exists source text not null default 'site';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reviews_source_check'
  ) then
    alter table public.reviews
      add constraint reviews_source_check
      check (source in ('site', 'google'));
  end if;
end $$;

comment on column public.reviews.author_name is
  'Display name for curated / Google quotes when customer_id is null.';
comment on column public.reviews.source is
  'site = in-app customer review; google = curated from Google Maps.';

-- Allow admins to insert curated rows (customer_id may be null).
drop policy if exists "reviews admin insert" on public.reviews;
create policy "reviews admin insert"
  on public.reviews for insert
  with check (public.is_admin());
