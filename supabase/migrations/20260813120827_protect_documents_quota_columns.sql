-- Lock document identity / quota columns from the authenticated client.
-- Ingest may UPDATE status and error only. Plan quotas stay in Server Actions;
-- this stops a browser client from spoofing byte_size after insert.
-- See: https://supabase.com/docs/guides/database/postgres/column-level-security

revoke update on table public.documents from anon;
revoke update on table public.documents from authenticated;

grant update (status, error) on table public.documents to authenticated;
