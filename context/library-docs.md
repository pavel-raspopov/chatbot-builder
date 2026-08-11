# Library Docs

Project-specific usage patterns for every third-party library in this project. This file only covers how we use each library in **DocuChat** — rules, patterns, and constraints.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

1. **Check AGENTS.md** — lists installed skills and project rules.
2. **Check if an MCP server is configured** for that library. If available and relevant, use it. **Do not use InsForge MCP** on this project.
3. **Read this file** for project-specific patterns that override general knowledge.

Order of authority:

```
MCP (when relevant) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

---

## Next.js

**Scaffolded:** Next.js **16.3** App Router, React 19, TypeScript strict, import alias `@/*`, **no `src/` directory** (`app/` at repo root).

### Rules

- Read installed docs under `node_modules/next/dist/docs/` before using Next-specific APIs (this major differs from older training data).
- App Router only; Server Components by default; `"use client"` only when needed.
- Fonts: `next/font/google` — Public Sans → `--font-public-sans`, Literata → `--font-literata` on `<html>`; `@theme` maps `--font-sans` / `--font-display` to those variables.
- Env placeholders live in `.env.example` (do not commit real secrets). `.gitignore` allows `!.env.example`.

### Scripts

- `npm run dev` — local marketing/app
- `npm run build` — production verify
- `npm run lint` — ESLint (`eslint-config-next`)

---

## Supabase

**Packages:** `@supabase/supabase-js`, `@supabase/ssr` (installed)

### Clients

| File | When |
| --- | --- |
| `lib/supabase/client.ts` | Browser / `"use client"` only — `createBrowserClient` |
| `lib/supabase/server.ts` | RSC, Server Actions, Route Handlers — `createServerClient` with cookies |
| `lib/supabase/proxy.ts` | `updateSession` used by root `proxy.ts` — refresh + route gates |
| `lib/supabase/env.ts` | Shared URL / public key helpers |
| `lib/supabase/database.types.ts` | Generated `Database` types (regenerate after schema changes) |
| `lib/supabase/admin.ts` | Server-only service role — add when ingest / widget / Stripe webhook need elevated writes (deferred; not required for Phase 1) |

### Schema / migrations

- SQL under `supabase/migrations/` (CLI `supabase init` + `supabase migration new`).
- Apply to the linked remote project with Supabase MCP `apply_migration` (name in snake_case); keep repo SQL in sync.
- `vector` lives in schema `extensions`; `chunks.embedding` is `vector(768)` with **HNSW** (`vector_cosine_ops`).
- RPC: `match_chunks(p_bot_id, p_query_embedding, p_match_count)` — `SECURITY INVOKER` so RLS applies; service role bypasses RLS for widget later.
- Profiles: `handle_new_user` trigger on `auth.users`; `EXECUTE` revoked from `anon`/`authenticated` (trigger-only).
- Storage bucket `documents` is private; object path first folder = `auth.uid()`.

### Env

- Prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy JWT) is accepted as fallback.
- `SUPABASE_SERVICE_ROLE_KEY` server-only — never expose to the browser.

### Rules

- Enable RLS on all user-owned tables; policies filter by `auth.uid()`.
- Enable `vector` extension; embedding column dimension must match the embedding model (**768** for Gemini `gemini-embedding-001` with `output_dimensionality: 768`).
- Expose similarity search via a SQL function / RPC such as `match_chunks(bot_id, query_embedding, match_count)`.
- Storage bucket `documents`: path prefix `{user_id}/...`; authenticated write; private read via signed URLs or server download.
- Next.js 16: use root **`proxy.ts`** (not deprecated `middleware.ts`) with `@supabase/ssr` cookie `getAll` / `setAll`. Call `supabase.auth.getClaims()` to refresh/verify — do not trust `getSession()` alone in proxy.
- Widget visitors are not Supabase users — do not require their JWT for `/api/widget/chat`.

### Auth

- MVP: email/password only (`actions/auth.ts`). OAuth later if time allows.
- Protect `/dashboard`, `/bots`, `/settings/*` in `lib/supabase/proxy.ts`; redirect authed users away from `/login` and `/signup`.
- `profiles` row created on signup via `handle_new_user` trigger (backfilled for existing users).
- Profiles billing/usage columns are **not** client-updatable: `REVOKE UPDATE` from `authenticated`/`anon`; service_role writes plan/Stripe/usage. See migration `protect_profiles_billing_columns`.
- For local demo: Auth → Providers → Email → disable **Confirm email** so signup returns a session immediately.

---

## Gemini (AI provider)

**Package:** `@google/genai` (official Google Gen AI SDK)

### Models (locked)

| Use | Model | Notes |
| --- | --- | --- |
| Embeddings | `gemini-embedding-001` | Set `output_dimensionality: 768`; store as `vector(768)` in Postgres |
| Chat | `gemini-2.5-flash` | In-app + widget answers; stream when the UI supports it |

### Rules

- `GEMINI_API_KEY` server-only — never ship to the browser.
- Shared pipeline for in-app and widget chat (`lib/rag/*` + thin route wrappers) via `lib/gemini.ts`.
- Cap max context chunks (e.g. top 5–8) and max output tokens for cost control.
- Do **not** add OpenAI as a second provider in MVP. If models change, update this section and `architecture.md` together.

### Client sketch

```typescript
// lib/gemini.ts — server only
import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
```

---

## Stripe (test mode)

**Package:** `stripe`

### Flow

1. `POST /api/stripe/checkout` creates a Checkout Session with `client_reference_id` / metadata = user id + target plan.
2. `POST /api/stripe/webhook` verifies signature and updates `profiles.plan` (+ Stripe customer/subscription ids).
3. Billing UI may also open Customer Portal for cancellation/change in test mode.

### Rules

- Use **test** keys only for this demo.
- Map price IDs via env: `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`.
- Free plan needs no Stripe customer.
- Feature gates live in `lib/plans.ts` and are enforced on the server.
- Prefer real Stripe test Checkout over a fake “mock billing” screen that never hits Stripe. Mock only if credentials are unavailable — then document the mock clearly in the UI.

### Plan limits (canonical)

Defined also in `project-overview.md` / `PRODUCT.md`:

| Plan | Bots | Messages/mo | Storage | Remove widget branding |
| --- | --- | --- | --- | --- |
| free | 1 | 100 | 10 MB | no |
| pro | 5 | 2,000 | 200 MB | yes |
| business | 20 | 10,000 | 1 GB | yes |

---

## PDF / text extraction

- Prefer a maintained PDF text extractor suitable for Node (document choice at implement time; pin version in package.json).
- Accept `.pdf`, `.md`, `.txt` in MVP.
- On extract failure: set `documents.status = failed` with a user-visible error — never silent fail.

---

## Embed widget script

- Ship `public/widget.js` (vanilla JS) or a tiny built IIFE — avoid requiring React on customer sites.
- Config via `data-bot` (public_id) and optional `data-color` later.
- Call `NEXT_PUBLIC_APP_URL/api/widget/chat`.
- Show “Powered by DocuChat” unless plan allows `remove_branding`.

---

## Tailwind CSS

**Scaffolded:** Tailwind CSS **v4** via `@tailwindcss/postcss` + `app/globals.css` (`@import "tailwindcss"` + `@theme { … }` from `ui-tokens.md`).

- Follow installed Tailwind skills under `.agents/skills/` when relevant.
- Use token utilities only (`bg-accent`, `text-text-primary`, `border-border`, `shadow-card`, …).
- Never use raw palette color utilities for brand/UI chrome (`bg-emerald-600`, `text-gray-500`).
- Motion helpers for landing live in `globals.css` (`.animate-fade-up`, `.animate-hero-mock`) and honor `prefers-reduced-motion`.

---

## Libraries We Do Not Use

- InsForge / `@insforge/sdk`
- OpenAI / `openai` SDK (chatbot uses Gemini only)
- Adzuna, Browserbase, Stagehand
- PostHog (unless explicitly added later — not required by the brief)
