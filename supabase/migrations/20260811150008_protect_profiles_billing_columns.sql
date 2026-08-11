-- Lock billing / usage columns on profiles from the authenticated client.
-- Prefer column privileges (hard block before RLS) for authority fields on
-- the same row; service_role retains table UPDATE for webhooks/ingest.
-- See: https://supabase.com/docs/guides/database/postgres/column-level-security

revoke update on table public.profiles from anon;
revoke update on table public.profiles from authenticated;

-- No user-editable profile columns in MVP (email comes from Auth trigger).
-- Authenticated clients may SELECT own row; privileged writes use service_role.

-- Keep RLS UPDATE policy for defense in depth if grants are restored later,
-- and lock privileged columns via WITH CHECK against current values.
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and plan = (select p.plan from public.profiles p where p.id = (select auth.uid()))
    and stripe_customer_id is not distinct from (
      select p.stripe_customer_id from public.profiles p where p.id = (select auth.uid())
    )
    and stripe_subscription_id is not distinct from (
      select p.stripe_subscription_id from public.profiles p where p.id = (select auth.uid())
    )
    and messages_used_month = (
      select p.messages_used_month from public.profiles p where p.id = (select auth.uid())
    )
    and messages_reset_at = (
      select p.messages_reset_at from public.profiles p where p.id = (select auth.uid())
    )
  );
