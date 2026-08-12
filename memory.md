# Memory — 07 Bot detail docs upload

Last updated: 2026-08-12 (evening)

## What was built

- **07 Bot detail — docs upload:** `lib/documents.ts` (MIME/extension allowlist, path helpers, `formatBytes`); `actions/documents.ts` (`createDocument` quota + pending row; `deleteDocument` Storage + row); `components/bots/DocumentUpload.tsx`, `DocumentsList.tsx`; bot detail page wired with docs + account storage usage
- **Client env fix:** `lib/supabase/env.ts` uses static `process.env.NEXT_PUBLIC_*` reads so Turbopack inlines values for browser Storage upload
- **Docs:** progress-tracker / build-plan (07 done, next 08), ui-registry (Document upload + Documents list), `.impeccable/surfaces/bots.md`

## Decisions made

- Split flow: Server Action creates pending `documents` row after quota check; browser uploads bytes to Storage (avoids Server Action body size limits vs 50 MB bucket objects)
- Storage path: `{user_id}/{bot_id}/{documentId}-{safeFilename}`
- Account-wide storage quota via sum of `documents.byte_size` vs `getPlanLimits().maxStorageBytes`
- Docs stay `status = pending` until **08** ingest; bot field edit still deferred
- Free plan storage restored to **10 MB** after temporary 100 KB quota testing

## Problems solved

- Drag-drop upload crashed with `Missing NEXT_PUBLIC_SUPABASE_URL` because dynamic `process.env[name]` is not inlined on the client — fixed with static property access in `env.ts`
- Quota gate verified (temporarily 100 KB Free limit, then reverted)

## Current state

- Phase 2; **07 complete**; upload/list/delete + Free storage quota work; lint/build previously green
- Documents appear as Pending; no extract/chunk/embed yet
- Billing still stub

## Next session starts with

**08 Ingest / RAG indexing** — extract PDF/md/txt → chunk → embed → write `chunks`; update document status (`processing` / `ready` / `failed`); show errors clearly.

## Open questions

- None blocking 08.
