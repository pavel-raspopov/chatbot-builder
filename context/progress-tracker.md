# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 3 — Chat
**Last completed:** 09 In-app chat UI — `/bots/[id]/chat` + `POST /api/chat` (retrieve, Gemini stream, quota)
**Next:** 10 Embed snippet + preview

---

## Progress

### Phase 1 — Foundation

- [x] 01 Landing page
- [x] 02 Auth
- [x] 03 Database + Storage schema
- [x] 04 App shell

### Phase 2 — Bots + Knowledge

- [x] 05 Dashboard
- [x] 06 Bots list + create
- [x] 07 Bot detail — docs upload
- [x] 08 Ingest / RAG indexing

### Phase 3 — Chat

- [x] 09 In-app chat UI

### Phase 4 — Embed Widget

- [ ] 10 Embed snippet + preview
- [ ] 11 Public widget API + script

### Phase 5 — Billing

- [ ] 12 Pricing gates + Stripe test Checkout

### Phase 6 — Polish + Demo

- [ ] 13 Polish
- [ ] 14 Presentation

---

## Notes

- 2026-08-13 Phase 3: in-app chat at `/bots/[id]/chat`; shared `lib/rag/retrieve.ts` + `lib/rag/answer.ts`; `POST /api/chat` SSE; quota via `consume_message_quota` RPC (no service role on the in-app path); resume latest app conversation; no citation chips
- 2026-08-13 Phase 2 hardening: bot settings edit, Storage API delete on bot remove, pending Retry, ingest 409 unless `force`, billing usage page (no Stripe yet), documents column lock (`status`/`error` only)
- Source of truth for requirements: `context/project-brief.md`
- Stack: Supabase + Gemini + Stripe test — never InsForge / OpenAI for chatbot
- App scaffolded: Next.js 16 App Router, Tailwind CSS v4 `@theme` tokens, Literata + Public Sans
- `lib/plans.ts` holds Free/Pro/Business marketing copy + `planLimits` / `getPlan` / `getPlanLimits` (enforce write gates server-side in 06+)
- Auth uses `@supabase/ssr` + root `proxy.ts`; public key via `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon JWT fallback)
- Schema lives in `supabase/migrations/`; applied to remote via Supabase MCP `apply_migration`. Types: `lib/supabase/database.types.ts`
- Profiles: authenticated cannot UPDATE (billing/usage locked); service_role updates plan via webhooks later
- Auth Confirm email: disable in Supabase Auth settings for seamless local demo (signup message documents this)
