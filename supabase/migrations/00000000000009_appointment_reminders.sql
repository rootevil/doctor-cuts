-- Appointment reminder emails: track send + booking locale for copy.

alter table public.appointments
  add column if not exists reminder_sent_at timestamptz;

alter table public.appointments
  add column if not exists locale text not null default 'it';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'appointments_locale_check'
  ) then
    alter table public.appointments
      add constraint appointments_locale_check
      check (locale in ('it', 'en'));
  end if;
end$$;

comment on column public.appointments.reminder_sent_at is
  'Set when the day-before reminder email was sent; null means not yet reminded.';
comment on column public.appointments.locale is
  'UI locale used at booking time (it|en) for transactional email copy.';
