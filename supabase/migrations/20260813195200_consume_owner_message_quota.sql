-- Increment a bot owner's monthly message counter from the widget path.
-- Visitors have no JWT; service_role only. Plan caps stay in lib/plans.ts (p_max).

create or replace function public.consume_owner_message_quota(
  p_user_id uuid,
  p_max integer
)
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
  v_used integer;
  v_reset timestamptz;
  v_now timestamptz := now();
begin
  if p_user_id is null then
    raise exception 'Owner id is required';
  end if;

  if p_max is null or p_max < 1 then
    raise exception 'Invalid message limit';
  end if;

  select p.messages_used_month, p.messages_reset_at
    into v_used, v_reset
  from public.profiles as p
  where p.id = p_user_id
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
      where id = p_user_id;

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
    where id = p_user_id;

  allowed := true;
  used := v_used;
  month_limit := p_max;
  return next;
end;
$$;

revoke all on function public.consume_owner_message_quota(uuid, integer) from public;
revoke execute on function public.consume_owner_message_quota(uuid, integer) from anon;
revoke execute on function public.consume_owner_message_quota(uuid, integer) from authenticated;
grant execute on function public.consume_owner_message_quota(uuid, integer) to service_role;
