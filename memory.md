# Memory — 08 Ingest / RAG indexing

Last updated: 2026-08-12 (evening)

## What was built

- **08 Ingest / RAG indexing:** `lib/gemini.ts` (768-d `embedTexts`); `lib/rag/extract.ts`, `chunk.ts`, `ingest.ts`; `lib/rag/pdfjs-polyfill.ts`; `lib/ingest-client.ts`; `POST app/api/ingest/route.ts`
- **UI:** `DocumentUpload` auto-POSTs ingest after Storage upload (Uploading… → Indexing…); `DocumentsList` Retry on failed/stuck processing
- **Deps:** `@google/genai`, `unpdf`
- **Docs:** progress-tracker / build-plan (08 done, next 09), ui-registry, library-docs, `.impeccable/surfaces/bots.md`

## Decisions made

- Auto-start ingest after upload via sync `POST /api/ingest` under user session + RLS (no `admin.ts` yet)
- PDF via `unpdf`; md/txt UTF-8; chunk ~600 chars / ~100 overlap; embeddings `gemini-embedding-001` @ 768-d
- Retry re-runs ingest (deletes prior chunks first); retrieval / chat deferred to 09

## Problems solved

- PDF.js on Node logged `Math.sumPrecise is not a function` + font-substitution warnings during extract — polyfill + `verbosity: 0` on `getDocumentProxy`
- Client Storage env inlining was already fixed in 07 (`lib/supabase/env.ts` static `NEXT_PUBLIC_*`)

## Current state

- Phase 2; **08 complete**; upload → index → Ready verified on real PDF; lint/build green
- Chunks written for ready docs; no in-app chat yet
- Billing still stub

## Next session starts with

**09 In-app chat UI** — ChatGPT-like thread on `/bots/[id]/chat`; then wire retrieval + Gemini (`lib/rag/retrieve.ts` + `/api/chat`)

## Open questions

- None blocking 09.
