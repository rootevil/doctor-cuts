-- Appointments: clients may read their own rows. Inserts and payment
-- fields are written only by the service role (server actions) or admins.
-- Guest/anon PostgREST insert was able to create a confirmed slot with no
-- deposit. Customer UPDATE could set payment_status = paid or shrink
-- deposit_cents.

drop policy if exists "appointments insert own" on public.appointments;
drop policy if exists "appointments insert guest" on public.appointments;
drop policy if exists "appointments update own or admin" on public.appointments;

drop policy if exists "appointments insert admin" on public.appointments;
create policy "appointments insert admin"
  on public.appointments for insert
  with check (public.is_admin());

drop policy if exists "appointments update admin" on public.appointments;
create policy "appointments update admin"
  on public.appointments for update
  using (public.is_admin())
  with check (public.is_admin());

-- Customer reviews cannot self-approve or self-feature.
drop policy if exists "reviews insert own" on public.reviews;
create policy "reviews insert own"
  on public.reviews for insert
  with check (
    customer_id = auth.uid()
    and status = 'pending'
    and is_featured = false
    and coalesce(source, 'site') = 'site'
  );

comment on policy "appointments insert admin" on public.appointments is
  'Customer and guest bookings are inserted with the service role, which bypasses RLS.';
