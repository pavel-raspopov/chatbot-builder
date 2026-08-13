# Memory — 11 Public widget API + script

Last updated: 2026-08-13 (late evening)

## What was built

- `POST` / `OPTIONS` `/api/widget/chat` — CORS `*`, in-memory IP+bot rate limit, SSE same shape as in-app
- `consume_owner_message_quota` RPC (`service_role` only) + `consumeOwnerMessageQuota` in `lib/usage.ts`
- `getOrCreateWidgetConversation` (`source=widget`, `user_id` null)
- Live `WidgetPanel` composer via `streamWidgetReply`; `widget.js` stays a launcher
- In-app `ChatThread` locked to `h-[calc(100dvh-14rem)]` so long threads scroll inside the panel

## Decisions made

- Widget chat uses the service-role client after `public_id` + rate limit + owner quota. Do not expand `get_bot_widget_config` to return `system_prompt` or `user_id`.
- Prefer publishable key in the browser; privileged server key lives in `SUPABASE_SERVICE_ROLE_KEY` (Secret `sb_secret_…` or legacy JWT). Never `NEXT_PUBLIC_`.
- Ephemeral widget thread (React state only). Host refresh starts a new conversation; launcher toggle keeps the iframe.
- Gemini free-tier generate-content cap is 20/day per model (`gemini-3.6-flash`). A widget/in-app “Could not generate a reply” after a 200 SSE is that quota, not a broken embed path.
- Next.js font preload console warnings are harmless; leave them.

## Problems solved

- Visitor JWT cannot consume the owner’s quota (`consume_message_quota` uses `auth.uid()`). Owner RPC is service-role only.
- `supabase migration new` stamped UTC earlier than an existing later-named file — renamed so it sorts last.
- In-app chat used `min-h-[calc(100dvh-14rem)]`, so the page grew with the thread. Fixed height + inner `overflow-y-auto`.

## Current state

- Phase 4 item 11 complete; user verified live widget answers.
- Local privileged key is required for widget chat (name only: `SUPABASE_SERVICE_ROLE_KEY`). Not in git.
- Gemini free-tier may 429 after ~20 generate calls/day; wait or enable Google AI billing.
- Lint/build green when 11 shipped.

## Next session starts with

**12 Pricing gates + Stripe test Checkout** — billing page, Checkout session, webhook → `profiles.plan`, server-side gates (bots, messages, storage, branding toggle).

## Open questions

- None blocking 12.

## 2026-08-13 — Tests / TDD

- No test runner until Phase 6. Verify with `npm run lint`, `npm run build`, and a manual click-through.
- TDD waived. Do not edit shared `lib/` (`rag`, `plans`, `usage`, Supabase clients) unless the feature plan lists them. A one-line type/compile fix in frozen code is allowed if the named verify command fails on it.
