-- Guest bookings: allow appointments without a signed-in customer.
--
-- Design decisions:
--  1. `customer_id` becomes NULL-able. Guest rows also carry the guest's
--     name + email + phone inline; the row is the source of truth for who
--     to contact.
--  2. Every guest row gets a `manage_token` — 32 random bytes rendered as
--     url-safe base64. The token is delivered in the confirmation email
--     and used to view/cancel the booking from the public
--     `/gestisci-prenotazione/{reference}?t=...` page. Treat it as an
--     opaque bearer secret: server compares in constant time before
--     honouring a guest action.
--  3. A CHECK constraint enforces mutual exclusivity: either
--     `customer_id` is set, OR the guest_* + manage_token trio is set.
--     This makes it impossible to insert a "half-guest" row.
--  4. RLS: a new INSERT policy lets the `anon` role create guest rows,
--     but only when the guest fields are present *and* customer_id is
--     NULL. Signed-in users keep their existing "own row" policy.

set search_path = public, extensions;

alter table public.appointments
  alter column customer_id drop not null;

alter table public.appointments
  add column if not exists guest_name    text,
  add column if not exists guest_email   extensions.citext,
  add column if not exists guest_phone   text,
  add column if not exists manage_token  text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'appointments_customer_or_guest'
  ) then
    alter table public.appointments
      add constraint appointments_customer_or_guest
      check (
        customer_id is not null
        or (guest_name is not null and guest_email is not null and manage_token is not null)
      );
  end if;
end$$;

create unique index if not exists appointments_manage_token_idx
  on public.appointments (manage_token)
  where manage_token is not null;

create index if not exists appointments_guest_email_idx
  on public.appointments (guest_email)
  where guest_email is not null;

-- --- RLS ------------------------------------------------------------------

-- Widen SELECT so a signed-in customer can still see rows they own, admins
-- see all, and guests see nothing through PostgREST — the guest management
-- page uses a service-role server action instead of relying on RLS to
-- expose guest rows.
drop policy if exists "appointments select own" on public.appointments;
create policy "appointments select own"
  on public.appointments for select
  using (customer_id = auth.uid() or public.is_admin());

-- INSERT: keep the "own row" path for signed-in customers, add a strict
-- guest path for anonymous users.
drop policy if exists "appointments insert own" on public.appointments;
create policy "appointments insert own"
  on public.appointments for insert
  with check (
    (auth.uid() is not null and customer_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "appointments insert guest" on public.appointments;
create policy "appointments insert guest"
  on public.appointments for insert
  to anon, authenticated
  with check (
    customer_id is null
    and guest_name is not null
    and length(guest_name) between 1 and 120
    and guest_email is not null
    and length(guest_email::text) between 3 and 254
    and manage_token is not null
    and length(manage_token) between 24 and 64
  );

-- UPDATE for guests is intentionally NOT exposed via RLS. Guest
-- cancellations go through the server action `cancelGuestBooking`, which
-- uses the service-role key and verifies the manage_token in application
-- code. This avoids leaking the token to PostgREST-derived queries.
