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
| `lib/supabase/admin.ts` | Server-only service role — `createAdminClient()`. Widget chat (`POST /api/widget/chat`) and Stripe webhooks. In-app chat quota uses `consume_message_quota` RPC (user JWT), not this client.

### Schema / migrations

- SQL under `supabase/migrations/` (CLI `supabase init` + `supabase migration new`).
- Apply to the linked remote project with Supabase MCP `apply_migration` (name in snake_case); keep repo SQL in sync.
- `vector` lives in schema `extensions`; `chunks.embedding` is `vector(768)` with **HNSW** (`vector_cosine_ops`).
- RPC: `match_chunks(p_bot_id, p_query_embedding, p_match_count)` — `SECURITY INVOKER` so RLS applies; widget chat calls it with the service-role client (RLS bypassed).
- RPC: `consume_message_quota(p_max)` — `SECURITY DEFINER`, scoped to `auth.uid()`; authenticated cannot UPDATE profile quota columns directly. Plan caps stay in `lib/plans.ts`.
- RPC: `consume_owner_message_quota(p_user_id, p_max)` — `SECURITY DEFINER`, same month-reset logic for a bot owner. `EXECUTE` granted to `service_role` only (revoked from `anon`/`authenticated`). Used by widget chat via `consumeOwnerMessageQuota` in `lib/usage.ts`.
- RPC: `get_bot_widget_config(p_public_id)` — `SECURITY DEFINER`, returns only `public_id`, `name`, `welcome_message`, `remove_branding` for the embed preview. `remove_branding` is **effective**: bot flag AND owner `profiles.plan` in (`pro`, `business`). `EXECUTE` granted to `anon` (intentional). Never returns `system_prompt` or `user_id`.
- Profiles: `handle_new_user` trigger on `auth.users`; `EXECUTE` revoked from `anon`/`authenticated` (trigger-only).
- Storage bucket `documents` is private; object path first folder = `auth.uid()`.
- Documents: authenticated `UPDATE` is column-limited to `status` and `error` (`protect_documents_quota_columns`). Delete files with `storage.remove` (not SQL) before or with the row delete — `deleteDocument` and `deleteBot` both do this.

### Env

- Prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy JWT) is accepted as fallback.
- `SUPABASE_SERVICE_ROLE_KEY` server-only — never expose to the browser.
- `NEXT_PUBLIC_APP_URL` — public origin for the copy-paste embed snippet (`lib/app-url.ts`). Fallback `http://localhost:3000`.
- Stripe test: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` (see Stripe section). `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is unused.

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
- Profiles billing/usage columns are **not** client-updatable: `REVOKE UPDATE` from `authenticated`/`anon`; service_role writes plan/Stripe/usage via `applySubscriptionToProfile` (`lib/billing.ts`) from the Stripe webhook. See migration `protect_profiles_billing_columns`.
- Plan limits live in `lib/plans.ts` (`planLimits`, `getPlan`, `getPlanLimits`, `canRemoveBranding`) and are checked in Server Actions. RLS is ownership only.
- For local demo: Auth → Providers → Email → disable **Confirm email** so signup returns a session immediately.

---

## Gemini (AI provider)

**Package:** `@google/genai` (official Google Gen AI SDK)

### Models (locked)

| Use | Model | Notes |
| --- | --- | --- |
| Embeddings | `gemini-embedding-001` | Set `output_dimensionality: 768`; store as `vector(768)` in Postgres |
| Chat | `gemini-3.6-flash` | In-app + widget answers; stream when the UI supports it. Replaces retired `gemini-2.5-flash` for new API keys. |

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

Use `embedTexts()` in `lib/gemini.ts` for ingest (`taskType: RETRIEVAL_DOCUMENT`) and chat retrieval (`RETRIEVAL_QUERY`). Store vectors as `[…]` strings for PostgREST/`vector(768)`.

Chat completions: `streamChatCompletion()` (`gemini-3.6-flash`, `maxOutputTokens: 1024`). Do not set `temperature` (deprecated on Gemini 3.x). Set `thinkingConfig.thinkingLevel` to `ThinkingLevel.MINIMAL` (SDK enum; a `"minimal"` string fails the current types) so RAG answers do not spend 10–50s in default medium thinking before the first token. Retrieval: `lib/rag/retrieve.ts` → `match_chunks` (k=8, similarity floor 0.25). Grounded stream: `lib/rag/answer.ts`. In-app route: authenticated `POST /api/chat` (SSE). Widget route: unauthenticated `POST /api/widget/chat` (SSE, CORS `*`, service role). Empty retrieval returns “I don’t know from your docs” without calling Gemini. Message quota: in-app `lib/usage.ts` → `consume_message_quota`; widget `consumeOwnerMessageQuota` → `consume_owner_message_quota` (owner’s monthly pool).

---

## Stripe (test mode)

**Package:** `stripe` (server only). No `@stripe/stripe-js` / Elements — Checkout and Portal are hosted redirects.

### Flow

1. `startCheckout` in `actions/billing.ts` creates a Checkout Session (`mode: subscription`) with `client_reference_id` / metadata = user id + target plan. Reuses `profiles.stripe_customer_id` when set. Used from Free only — an existing `stripe_subscription_id` must go through the Portal.
2. `POST /api/stripe/webhook` verifies `stripe-signature` (`request.text()` + `constructEvent`) and updates `profiles.plan` (+ customer/subscription ids) via `applySubscriptionToProfile`. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
3. `startPortal` opens Customer Portal for plan change / cancel. Missing Stripe env shows setup copy on `/settings/billing` — never fake-writes the plan.

### Rules

- Use **test** keys only for this demo (`sk_test_`, `price_`, `whsec_`).
- Map price IDs via env: `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` (also `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is unused (no Stripe.js).
- Free plan needs no Stripe customer. After cancel, keep `stripe_customer_id` and clear `stripe_subscription_id`.
- Feature gates live in `lib/plans.ts` (`planLimits`, `getPlan`, `getPlanLimits`, `canRemoveBranding`) and are enforced on the server for writes.
- Prefer real Stripe test Checkout over a fake “mock billing” screen that never hits Stripe. If keys are missing, the billing page says so; do not write `profiles.plan` from the app.
- Local webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Billing `?checkout=success` while still on Free hints at this.
- Widget branding: `updateBot` may set `bots.remove_branding` only when `canRemoveBranding(plan)`. The public RPC still ANDs with the owner’s plan. Downgrade to Free resets all of that owner’s bot flags.

### Plan limits (canonical)

Defined also in `project-overview.md` / `PRODUCT.md`:

| Plan | Bots | Messages/mo | Storage | Remove widget branding |
| --- | --- | --- | --- | --- |
| free | 1 | 100 | 10 MB | no |
| pro | 5 | 2,000 | 200 MB | yes |
| business | 20 | 10,000 | 1 GB | yes |

---

## PDF / text extraction

- **Package:** `unpdf` (serverless PDF.js build) — extract text from PDF in Node/Next Route Handlers.
- Before extract: polyfill `Math.sumPrecise` (`lib/rag/pdfjs-polyfill.ts`) and set PDF.js `verbosity` to errors-only so Node warning spam stays quiet.
- Accept `.pdf`, `.md`, `.txt` in MVP (`lib/rag/extract.ts`).
- On extract failure: set `documents.status = failed` with a user-visible error — never silent fail.
- Ingest pipeline: `lib/rag/ingest.ts` + `POST /api/ingest` (user session / RLS; no service role yet).
- Concurrent ingest: a second request while `status = processing` returns 409 unless `force: true` (Retry). Client timeout copy tells the user indexing may still be running.

---

## Embed widget script

- Ship `public/widget.js` (vanilla JS IIFE) — no React on customer sites.
- Config via `data-bot` (`public_id`). Script origin comes from `script.src`.
- Launcher injects a floating button + iframe to `/w/{public_id}/embed`. Chat runs inside the iframe (`POST /api/widget/chat`), not from `widget.js`.
- Widget API: CORS `Access-Control-Allow-Origin: *`, OPTIONS preflight, in-memory IP+bot rate limit (20/min free/pro, 60/min business), owner monthly quota, SSE same event shape as in-app. Requires `SUPABASE_SERVICE_ROLE_KEY`. Conversations persist with `source=widget` and `user_id` null.
- Show “Powered by DocuChat” unless effective `remove_branding` is true (bot flag AND paid plan). Toggle is on bot settings; Free cannot hide the badge.
- **Launcher CSS exception:** `widget.js` copies token hex from `ui-tokens.md` into inline styles because the host page has no Tailwind. Do not use hex in React/Tailwind components.

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
