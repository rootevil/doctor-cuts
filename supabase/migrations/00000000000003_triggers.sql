-- Doctor Cuts — helper functions and triggers.

-- Keep updated_at fresh on writable tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t record;
begin
  for t in
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('profiles', 'services', 'appointments', 'settings')
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at
       before update on public.%I
       for each row execute function public.set_updated_at();',
      t.table_name, t.table_name
    );
  end loop;
end$$;

-- Mirror new auth.users into public.profiles. Role starts at 'customer';
-- admin promotion happens at the application layer (see signUpAction /
-- scripts/seed-admin.mjs) using the service-role key. That keeps the DB
-- policy simple and avoids leaking the admin email into a Postgres GUC.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Booking reference codes: DC-XXXX where X is [0-9A-Z] excluding ambiguous chars.
create or replace function public.generate_reference_code()
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  code := 'DC-';
  for i in 1..4 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return code;
end;
$$;

create or replace function public.set_reference_code_if_missing()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  candidate text;
  tries int := 0;
begin
  if new.reference_code is null or new.reference_code = '' then
    loop
      candidate := public.generate_reference_code();
      exit when not exists (select 1 from public.appointments where reference_code = candidate);
      tries := tries + 1;
      if tries > 12 then
        raise exception 'could not allocate a unique appointment reference';
      end if;
    end loop;
    new.reference_code := candidate;
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_set_reference on public.appointments;
create trigger appointments_set_reference
before insert on public.appointments
for each row execute function public.set_reference_code_if_missing();
