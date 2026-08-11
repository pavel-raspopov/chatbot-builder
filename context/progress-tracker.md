# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 02 Auth — Supabase email/password, `proxy.ts` session refresh, `/login` + `/signup` forms, `/dashboard` placeholder
**Next:** 03 Database + Storage schema — migrations, RLS, `documents` bucket, `match_chunks`, profiles trigger

---

## Progress

### Phase 1 — Foundation

- [x] 01 Landing page
- [x] 02 Auth
- [ ] 03 Database + Storage schema
- [ ] 04 App shell

### Phase 2 — Bots + Knowledge

- [ ] 05 Dashboard
- [ ] 06 Bots list + create
- [ ] 07 Bot detail — docs upload
- [ ] 08 Ingest / RAG indexing

### Phase 3 — Chat

- [ ] 09 In-app chat UI

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

- Source of truth for requirements: `context/project-brief.md`
- Stack: Supabase + Gemini + Stripe test — never InsForge / OpenAI for chatbot
- App scaffolded: Next.js 16 App Router, Tailwind CSS v4 `@theme` tokens, Literata + Public Sans
- `lib/plans.ts` holds Free/Pro/Business gates for UI (enforce server-side when Auth/billing land)
- Auth uses `@supabase/ssr` + root `proxy.ts`; public key via `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon JWT fallback)
