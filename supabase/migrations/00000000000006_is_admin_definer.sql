-- Fix: `is_admin()` was `security invoker`, which caused an infinite RLS
-- recursion whenever a policy on `profiles` (or a table that joins to
-- `profiles`) evaluated the admin check. Concretely: any admin-side query
-- against `appointments` joined `profiles`; that hit the `profiles admin all`
-- policy which called `is_admin()`; `is_admin()` then queried `profiles`
-- itself; Postgres re-evaluated the same policy set on that inner read; boom
-- — `stack depth limit exceeded`.
--
-- Making the helper `security definer` (running with the function owner's
-- privileges) means it bypasses RLS for its one narrow lookup — the role of
-- the current auth.uid() — without exposing any row data to callers. Only a
-- boolean escapes. `search_path` is pinned so it can't be hijacked by a
-- shadowed `profiles` table in another schema.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Lock down execution so only server-side roles can call it. `anon` and
-- `authenticated` reach it indirectly through RLS policy evaluation, which is
-- fine — that path doesn't require EXECUTE on the function.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
