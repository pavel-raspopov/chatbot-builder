# Memory — 03 Database + Storage schema

Last updated: 2026-08-11 (evening)

## What was built

- `supabase/` init + migrations:
  - `supabase/migrations/20260811141039_docuchat_schema.sql` — profiles, bots, documents, chunks (`vector(768)` + HNSW), conversations, messages; RLS; `handle_new_user` trigger + backfill; `match_chunks` RPC; private Storage bucket `documents` + path policies
  - `supabase/migrations/20260811141504_revoke_handle_new_user_execute.sql` — revoke PostgREST EXECUTE on trigger fn
- Applied to remote project `qimzbnjsqfierkbqsepu` via MCP `apply_migration`
- `lib/supabase/database.types.ts`; browser/server clients typed with `Database`
- Context: progress-tracker 03 done; library-docs schema/migration notes; build-plan checklist

## Decisions made

- Plan fields on `profiles` only (no `subscriptions` table)
- Chunks RLS via bot ownership (no `user_id` on chunks)
- HNSW cosine index on embeddings; `match_chunks` is `SECURITY INVOKER`
- `admin.ts` still not added

## Problems solved

- Advisor WARN: `handle_new_user` executable by anon/authenticated — revoked EXECUTE (trigger still runs)
- Vector opclass resolution: `set search_path to public, extensions` in migration

## Current state

- Remote schema live; 2 profiles backfilled; RLS on all tables; `documents` bucket private
- `npm run lint` / `npm run build` pass with typed clients
- Auth Confirm email still a dashboard setting for local demo
- Remaining security advisor: leaked password protection (Auth dashboard — optional)

## Next session starts with

**04 App shell** — authenticated layout: navbar (Dashboard, Bots, Billing) + footer per architecture / ui-registry; dashboard can stay placeholder until 05.

## Open questions

- None blocking 04.
