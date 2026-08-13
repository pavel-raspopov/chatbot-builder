-- Increment the caller's monthly message counter without service_role.
-- Authenticated UPDATE on profiles is revoked; this SECURITY DEFINER RPC
-- only touches auth.uid()'s row. Plan caps stay in lib/plans.ts (p_max).

create or replace function public.consume_message_quota(p_max integer)
returns table (
  allowed boolean,
  used integer,
  month_limit integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_used integer;
  v_reset timestamptz;
  v_now timestamptz := now();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_max is null or p_max < 1 then
    raise exception 'Invalid message limit';
  end if;

  select p.messages_used_month, p.messages_reset_at
    into v_used, v_reset
  from public.profiles as p
  where p.id = v_user
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if v_reset <= v_now then
    v_used := 0;
    v_reset := date_trunc('month', v_now) + interval '1 month';
  end if;

  if v_used >= p_max then
    update public.profiles
      set
        messages_used_month = v_used,
        messages_reset_at = v_reset
      where id = v_user;

    allowed := false;
    used := v_used;
    month_limit := p_max;
    return next;
    return;
  end if;

  v_used := v_used + 1;

  update public.profiles
    set
      messages_used_month = v_used,
      messages_reset_at = v_reset
    where id = v_user;

  allowed := true;
  used := v_used;
  month_limit := p_max;
  return next;
end;
$$;

revoke all on function public.consume_message_quota(integer) from public;
revoke execute on function public.consume_message_quota(integer) from anon;
grant execute on function public.consume_message_quota(integer) to authenticated;
grant execute on function public.consume_message_quota(integer) to service_role;
