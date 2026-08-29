-- Refunded deposits + keep the appointments_payment_status check in sync.

alter table public.appointments
  add column if not exists stripe_refund_id text;

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'appointments_payment_status_check'
  ) then
    alter table public.appointments
      drop constraint appointments_payment_status_check;
  end if;
end$$;

alter table public.appointments
  add constraint appointments_payment_status_check
  check (payment_status in ('none', 'awaiting', 'paid', 'failed', 'expired', 'refunded'));

comment on column public.appointments.stripe_refund_id is
  'Stripe refund id after a deposit is returned on cancellation.';
