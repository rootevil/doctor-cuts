-- Launch hardening: lock down trigger-only function RPC access,
-- and cover foreign keys used by admin/payment joins.

-- handle_new_user is only meant as an auth.users trigger — not a public RPC.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
grant execute on function public.handle_new_user() to postgres, service_role;

-- Keep is_admin() executable by anon + authenticated: RLS policies call it
-- for both roles (e.g. services public read). Restricting anon breaks reads.

create index if not exists appointments_service_id_idx
  on public.appointments (service_id);

create index if not exists reviews_customer_id_idx
  on public.reviews (customer_id);
