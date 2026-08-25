-- €5 booking confirmation deposit (Nexi). Pending unpaid rows still block the
-- slot via appointments_no_overlap; expired holds are cancelled by the app.

alter table public.settings
  add column if not exists deposit_required boolean not null default true;

alter table public.settings
  add column if not exists deposit_cents integer not null default 500
    check (deposit_cents >= 0 and deposit_cents <= 50000);

comment on column public.settings.deposit_required is
  'When true and Nexi is configured, online bookings require a confirmation deposit.';
comment on column public.settings.deposit_cents is
  'Confirmation deposit in euro cents (500 = €5). Capped at the service price.';

alter table public.appointments
  add column if not exists payment_status text not null default 'none';

alter table public.appointments
  add column if not exists deposit_cents integer not null default 0;

alter table public.appointments
  add column if not exists nexi_order_id text;

alter table public.appointments
  add column if not exists nexi_security_token text;

alter table public.appointments
  add column if not exists payment_token text;

alter table public.appointments
  add column if not exists payment_expires_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'appointments_payment_status_check'
  ) then
    alter table public.appointments
      add constraint appointments_payment_status_check
      check (payment_status in ('none', 'awaiting', 'paid', 'failed', 'expired'));
  end if;
end$$;

create unique index if not exists appointments_payment_token_idx
  on public.appointments (payment_token)
  where payment_token is not null;

create unique index if not exists appointments_nexi_order_id_idx
  on public.appointments (nexi_order_id)
  where nexi_order_id is not null;

create index if not exists appointments_payment_expires_idx
  on public.appointments (payment_expires_at)
  where payment_status = 'awaiting' and status = 'pending';
