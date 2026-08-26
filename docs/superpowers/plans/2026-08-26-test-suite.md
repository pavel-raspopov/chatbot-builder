# DocuChat Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full automated test coverage for DocuChat — every `lib/` module, all 4 API routes, all 4 server actions, and interactive components.

**Architecture:** Vitest 3 runner (native ESM, TS strict, `@/` alias). Route handlers and server actions are imported directly and invoked with `Request`/`FormData` objects; boundaries (`@supabase/ssr`, `next/navigation`, `next/cache`, `stripe` SDK, `@google/genai`) are mocked with `vi.mock`. A shared fluent fake-Supabase builder (`tests/helpers/fake-supabase.ts`) powers all client-parameterized tests. Component tests use Testing Library under happy-dom via per-file `// @vitest-environment happy-dom`.

**Tech Stack:** vitest, @vitejs/plugin-react, @testing-library/{react,user-event,jest-dom}, happy-dom, @vitest/coverage-v8

## Global Constraints

- TypeScript strict; no `any` leaks in new files
- Never print or commit real secrets; webhook tests use fake test secrets only
- SQL migrations / RLS / quota RPC bodies are out of scope — RPCs asserted at call boundary
- Static landing pages get no tests
- Frozen files: production source may only change for a one-line type fix surfaced by tests (none expected)
- Verify per task: `npm run test`; final: `npm run lint && npm run build && npm run test:coverage`
- Commit per phase; `/remember save` discipline honored (memory.md stays untracked per 2026-08-26 decision)

## File Structure

- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/helpers/fake-supabase.ts`, `tests/fixtures/sample.{txt,md,pdf}`
- Create: `*.test.ts` co-located with each covered module (`lib/**`, `actions/**`, `app/api/**`)
- Create: `*.test.tsx` co-located with interactive components

## Tasks

### Task 1 — Scaffold (DONE)
Vitest config (node env default, globals on, coverage v8 scoped to lib/actions/api/components), setup file imports jest-dom matchers, npm scripts `test` / `test:watch` / `test:coverage`. Smoke test proves pipeline.

### Task 2 — Pure utilities
- `lib/plans.test.ts`: normalizePlanId fallbacks (null/undefined/garbage), getPlan/getPlanLimits per tier, canRemoveBranding (free=false, pro/business=true), plans array shape (3 entries, highlighted exactly once)
- `lib/app-url.test.ts`: env override trims trailing slash; default localhost when unset
- `lib/widget/cors.test.ts`: header values + non-mutating copy
- `lib/rag/chunk.test.ts`: empty/whitespace → []; short text single chunk; long text respects chunkChars/overlap invariants; soft-break preference; estimateTokenCount floor of 1
- `lib/documents.test.ts`: getFileExtension edge cases; resolveDocumentMimeType matrix; sanitizeFilename; buildDocumentStoragePath; formatBytes tiers; validateDocumentMeta accept/reject paths

### Task 3 — Rate limiting
- `lib/widget/rateLimit.test.ts`: getClientIp precedence (x-forwarded-for first entry > x-real-ip > fallback); widgetRateLimitPerMinute (business=60 else 20); allowWidgetRequest sliding window under fake timers, per-key isolation, stale timestamps pruned, deny at limit then allow after window slides

### Task 4 — Extraction
- Fixtures: `sample.txt`, `sample.md`, `sample.pdf` (generated with computed xref offsets so pdf.js parses it)
- `lib/rag/extract.test.ts`: real PDF extraction; md/txt decode + CRLF/NUL normalization; unsupported MIME → ExtractError; empty file → ExtractError; corrupt bytes as application/pdf → ExtractError

### Task 5 — RAG pipeline + usage + widget config + stripe helpers (DONE)
Shared fake Supabase (fluent, thenable query builder): tables keyed by op queues (`select|insert|update|delete`), `rpc(name)` handlers, `storage.download/remove`, `auth.*`.
- `lib/gemini.test.ts`: embedTexts batches of 20, count/length validation errors, empty input → [], formatEmbeddingForDb
- `lib/rag/retrieve.test.ts`: rpc args include formatted embedding + bot id; error → throw; filters empty content + similarity < 0.25; null data → []
- `lib/rag/answer.test.ts`: buildSystemInstruction includes grounding rules/custom prompt/excerpt numbering; streamGroundedAnswer yields deltas
- `lib/chat/persist.test.ts`: app/widget conversation get-or-create paths; insertMessage error mapping
- `lib/usage.test.ts`: consumeMessageQuota/consumeOwnerMessageQuota — load failure → 500; limit from plan as p_max; missing-RPC detection; disallowed → 429; malformed payload → 500; ok path returns used/limit
- `lib/widget/getBotConfig.test.ts`: blank id → null; rpc error → null; row shape validation (array or object, wrong types rejected)
- `lib/billing.test.ts`: applySubscriptionToProfile patch shape (customer id only when present; subscriptionId nulled on free; branding reset on free); findUserIdByCustomerId
- `lib/stripe.test.ts` (pure helpers, env stubs): isStripeConfigured, priceIdForPlan, planIdFromPriceId, planIdFromMetadata (strict raw match), readStripeId, priceIdFromSubscription

### Task 6 — API routes (DONE)
Mock boundary modules (`@/lib/supabase/server|admin`, `@/lib/rag/*`, `@/lib/usage`, `@/lib/chat/persist`) as needed.
- `app/api/chat/route.test.ts`: invalid JSON 400; missing botId/message 400; oversize 400; unauthenticated 401; bot-not-found 404; retrieve failure 500; quota exhausted 429; SSE stream emits deltas + done(conversationId); empty retrieval → UNKNOWN_FROM_DOCS; persist called for both roles
- `app/api/widget/chat/route.test.ts`: OPTIONS 204 + CORS headers; validation/auth-by-public-id; missing service role key 500; rate-limit 429; owner-plan drives limit; SSE success path
- `app/api/ingest/route.test.ts`: JSON/validation 400; 401; delegates to ingestDocument and maps result status/chunkCount
- `app/api/stripe/webhook/route.test.ts`: real signature verification via `stripe.webhooks.generateTestHeaderString` + fake secret; missing/invalid signature 400; checkout completed applies paid plan; non-subscription ignored; subscription.updated maps price→plan / unpaid → free downgrade; deleted → free; unknown events 200; apply-failure surfaces 500

### Task 7 — Server actions (DONE)
Mock `next/navigation`, `next/cache`, `@/lib/supabase/server`.
- `actions/auth.test.ts`: signIn validation/error passthrough/safe next path; signUp password <8, session vs confirm-email branches; signOut redirects "/"
- `actions/bots.test.ts`: createBot name required, plan gating, insert + revalidate + redirect; updateBot save/not-found; deleteBot storage batch remove, count=0 not-found, success revalidates
- `actions/documents.test.ts`: createDocument meta validation, bot ownership, storage-quota projection, insert pending row; deleteDocument storage tolerated-error, count semantics
- `actions/billing.test.ts`: startCheckout unconfigured Stripe, invalid plan, already-on-plan, existing subscription guard, redirect(url); startPortal no-customer + redirect

### Task 8 — Components (happy-dom)
Button/Input/Textarea render; LoginForm/SignupForm validation + submit; CreateBotForm; DocumentUpload accepted extensions + states; EmbedSnippet content + clipboard; ChatComposer disabled/submit behavior; ChatThread/ChatMessage render; UsageMeter thresholds.

### Task 9 — Wrap-up
Coverage thresholds from achieved numbers (global lines ≥ 70, lib ≥ 80 target), README "Testing" section, progress-tracker entry, `/remember save`.

## Out of scope
pgTAP/local-Supabase DB integration; E2E browser tests; static landing pages.
