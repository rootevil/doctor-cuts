-- Doctor Cuts — extensions and enums.
-- Idempotent: every statement is CREATE IF NOT EXISTS or wrapped in DO blocks.

create schema if not exists extensions;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;
create extension if not exists citext with schema extensions;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'admin');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type public.appointment_status as enum (
      'pending',
      'confirmed',
      'arrived',
      'completed',
      'cancelled',
      'no_show'
    );
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('pending', 'approved', 'rejected');
  end if;
end$$;
