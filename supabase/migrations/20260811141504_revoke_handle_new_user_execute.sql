-- Trigger-only: do not expose SECURITY DEFINER via PostgREST RPC
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to postgres, service_role;
