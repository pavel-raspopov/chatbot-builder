-- Effective widget branding: hide the badge only when the owner is on a paid plan.
-- SECURITY DEFINER so anon can read these columns despite owner-only RLS.
-- Does not return system_prompt or user_id. Intentional EXECUTE for anon.

create or replace function public.get_bot_widget_config(p_public_id text)
returns table (
  public_id text,
  name text,
  welcome_message text,
  remove_branding boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.public_id,
    b.name,
    b.welcome_message,
    (b.remove_branding and p.plan in ('pro', 'business')) as remove_branding
  from public.bots as b
  inner join public.profiles as p on p.id = b.user_id
  where b.public_id = p_public_id
  limit 1;
$$;

revoke all on function public.get_bot_widget_config(text) from public;
grant execute on function public.get_bot_widget_config(text) to anon;
grant execute on function public.get_bot_widget_config(text) to authenticated;
grant execute on function public.get_bot_widget_config(text) to service_role;
