# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 6 — done (waiting on HR)
**Last completed:** 14 Presentation — product demo (Video 1) recorded and sent
**Next / open point:** Video 2 technical walkthrough **only if they ask** — script is ready in `docs/demo/video-2-technical-script.md`

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

- [x] 10 Embed snippet + preview
- [x] 11 Public widget API + script

### Phase 5 — Billing

- [x] 12 Pricing gates + Stripe test Checkout

### Phase 6 — Polish + Demo

- [x] 13 Polish
- [x] 14 Presentation (Video 1 submitted; Video 2 is an open point — see Notes)

---

## Open point — Video 2 (if HR asks)

Do not record unless they want a technical follow-up. Then:

1. Read [`docs/demo/video-2-technical-script.md`](../docs/demo/video-2-technical-script.md) (B2 script, ~7 min)
2. OBS scenes: localhost + terminals → Supabase Table Editor (no API keys) → chat UI (Gemini path) → Stripe Dashboard **Test mode** → `context/project-brief.md` + `lib/plans.ts`
3. Hide `whsec_`, `sk_`, service role, `.env.local`
4. Export 1080p `docuchat-technical.mp4`

## Notes

- 2026-08-14 Phase 6 item 14: Video 1 product demo submitted to HR. Pack in `docs/demo/`. **Open point:** Video 2 technical (script ready, not recorded). Root `README.md` added for GitHub.
- 2026-08-14 Phase 6 item 14 pack: scripts and FAQ in `docs/demo/` — README (tools, dry-run, no secrets), `video-1-product-script.md`, `video-2-technical-script.md`, `northwind-desk-faq.md`. Video 1 path: landing → signup → upload → Open chat → embed Preview → Billing Upgrade to Pro. Local Stripe still needs `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- 2026-08-14 Phase 6 item 13: Feature-review Important fixes — widget preview copy (live replies), retrieve-then-quota and persist user+assistant after a successful stream (`/api/chat` and `/api/widget/chat`), in-app chat fills remaining viewport (`AppShell` hides footer on chat), `loading.tsx` / `error.tsx` / `not-found.tsx`, `app/icon.svg`. Skipped seed demo bot and remaining Minor items (clipboard alert, stripe listen hint, mobile Features links). Next: 14 Presentation.

- 2026-08-14 Phase 5: Stripe test Checkout + Portal via `actions/billing.ts`; webhook `POST /api/stripe/webhook`; `applySubscriptionToProfile` (service role). Branding checkbox on bot settings; `get_bot_widget_config` returns effective `remove_branding` (flag AND paid plan). Live Checkout needs `STRIPE_SECRET_KEY` + `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS` + `stripe listen` for `STRIPE_WEBHOOK_SECRET`. Decision: Server Actions for Checkout/Portal; Route Handler only for the webhook (not `app/api/stripe/checkout`).
- 2026-08-13 Phase 4 done: widget chat at `POST /api/widget/chat` (service role, CORS `*`, in-memory rate limit, `consume_owner_message_quota`); iframe `WidgetPanel` streams via `streamWidgetReply`. Requires `SUPABASE_SERVICE_ROLE_KEY`.
- 2026-08-13 Phase 4 start: embed snippet on bot detail; `public/widget.js` launcher + iframe to `/w/[publicId]/embed`; public preview page; `get_bot_widget_config` RPC (anon). No widget chat API yet.
- 2026-08-13 Phase 3: in-app chat at `/bots/[id]/chat`; shared `lib/rag/retrieve.ts` + `lib/rag/answer.ts`; `POST /api/chat` SSE; quota via `consume_message_quota` RPC (no service role on the in-app path); resume latest app conversation; no citation chips
- 2026-08-13 Phase 2 hardening: bot settings edit, Storage API delete on bot remove, pending Retry, ingest 409 unless `force`, billing usage page (no Stripe yet), documents column lock (`status`/`error` only)
- Source of truth for requirements: `context/project-brief.md`
- Stack: Supabase + Gemini + Stripe test — never InsForge / OpenAI for chatbot
- App scaffolded: Next.js 16 App Router, Tailwind CSS v4 `@theme` tokens, Literata + Public Sans
- `lib/plans.ts` holds Free/Pro/Business marketing copy + `planLimits` / `getPlan` / `getPlanLimits` / `canRemoveBranding` (enforce write gates server-side)
- Auth uses `@supabase/ssr` + root `proxy.ts`; public key via `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon JWT fallback)
- Schema lives in `supabase/migrations/`; applied to remote via Supabase MCP `apply_migration`. Types: `lib/supabase/database.types.ts`
- Profiles: authenticated cannot UPDATE (billing/usage locked); service_role updates plan via Stripe webhook
- Auth Confirm email: disable in Supabase Auth settings for seamless local demo (signup message documents this)
