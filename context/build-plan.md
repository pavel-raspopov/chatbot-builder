# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is wired step by step. Every feature must be visible and testable before moving to the next. No invisible backend-only phases.

Aligns with `context/project-brief.md` deliverables: landing, functioning web app (upload → chat → embed + billing), presentation later.

---

## Phase 1 — Foundation

### 01 Landing page

**UI:** Hero, features, pricing (Free/Pro/Business), CTAs, footer. Descriptive enough that users want to try the product.

**Logic:** CTAs → `/signup` or `/login` (or `/dashboard` if authenticated).

### 02 Auth

**UI:** Login / signup forms (or OAuth buttons if chosen).

**Logic:** Supabase Auth; middleware protecting app routes; redirect to `/dashboard`.

### 03 Database + Storage schema

**Logic:** Migrations for `profiles`, `bots`, `documents`, `chunks` (pgvector), `conversations`, `messages`; RLS; `documents` storage bucket; `match_chunks` RPC. Trigger or action to create `profiles` row on signup.

### 04 App shell

**UI:** Authenticated layout — navbar (Dashboard, Bots, Billing), footer.

---

## Phase 2 — Bots + Knowledge

### 05 Dashboard

**UI:** Bot count, usage (messages), plan badge, empty states, CTA to create bot / upgrade.

### 06 Bots list + create

**UI:** List bots; create form (name, welcome message, system prompt).

**Logic:** CRUD under RLS; enforce plan bot limits server-side.

### 07 Bot detail — docs upload

**UI:** Upload dropzone, document list with status, delete.

**Logic:** Upload to Storage; create `documents` row; enforce storage quota.

### 08 Ingest / RAG indexing

**Logic:** Extract text from PDF/md/txt → chunk → embed → write `chunks`; update status. Show errors clearly.

---

## Phase 3 — Chat

### 09 In-app chat UI

**UI:** ChatGPT-like thread on `/bots/[id]/chat` (composer, streaming bubbles, empty state).

**Logic:** Mock replies first, then wire `/api/chat` with retrieval + LLM; message quota.

---

## Phase 4 — Embed Widget

### 10 Embed snippet + preview

**UI:** Copy-paste script on bot detail; optional `/w/[publicId]` preview.

### 11 Public widget API + script

**Logic:** `/api/widget/chat` with CORS + rate limits; `public/widget.js` floating UI; branding badge by plan.

---

## Phase 5 — Billing

### 12 Pricing gates + Stripe test Checkout

**UI:** Billing page — current plan, usage meters, upgrade buttons.

**Logic:** Checkout session; webhook updates plan; server-side gates for bots, messages, storage, branding. Prefer real Stripe test mode over fake mock billing.

---

## Phase 6 — Polish + Demo

### 13 Polish

Empty states, error copy, loading, mobile landing/app, seed demo bot if useful.

### 14 Presentation

Record screenshare + voiceover: signup → upload → in-app chat → embed on sample page → upgrade in Stripe test mode.

---

## Phase Checklist (mirrors progress-tracker)

- [x] 01 Landing page
- [x] 02 Auth
- [x] 03 Database + Storage schema
- [x] 04 App shell
- [x] 05 Dashboard
- [x] 06 Bots list + create
- [x] 07 Bot detail — docs upload
- [ ] 08 Ingest / RAG indexing
- [ ] 09 In-app chat UI
- [ ] 10 Embed snippet + preview
- [ ] 11 Public widget API + script
- [ ] 12 Pricing gates + Stripe test Checkout
- [ ] 13 Polish
- [ ] 14 Presentation
