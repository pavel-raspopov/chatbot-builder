# Memory — 09 In-app chat UI

Last updated: 2026-08-13 (evening)

## What was built

- In-app chat at `/bots/[id]/chat`: `ChatThread`, `ChatMessage`, `ChatComposer`, `ChatThinkingDots`
- Entry points: **Open chat** on bot detail, **Chat** on bots list
- `POST /api/chat` SSE: retrieve (`lib/rag/retrieve.ts`) → Gemini stream (`lib/rag/answer.ts`) → persist `conversations`/`messages`
- Quota: `consume_message_quota` RPC (user JWT, `SECURITY DEFINER` on `auth.uid()` only) via `lib/usage.ts` — not the service-role client
- `lib/supabase/admin.ts` exists for Stripe/widget later; unused on the in-app chat path
- Surface brief: `.impeccable/surfaces/chat.md`

## Decisions made

- Resume latest `source=app` conversation; no sidebar; no citation chips
- Empty/low-similarity retrieval skips Gemini and says it does not know from the docs (still counts as a message)
- Chat model is `gemini-3.6-flash` (`thinkingLevel: minimal`); `gemini-2.5-flash` is unavailable to new API keys
- Expected 4xx (quota) is UI-only; do not `console.error` on the client. Browser Network 429 is normal
- Free `maxMessagesPerMonth` is 100 (temp test cap of 5/6 was reverted)

## Problems solved

- In-app quota cannot use authenticated `UPDATE` on `profiles` (column lock) and local `.env.local` has no service role key — RPC instead
- `gemini-2.5-flash` 404 for new keys — switched to `gemini-3.6-flash` and dropped `temperature`
- Default Gemini 3.x medium thinking caused 10–50s TTFB — set `thinkingLevel: minimal`
- Flashing caret while waiting — bouncing dots until first token

## Current state

- Phase 3 item 09 complete; user verified grounded answers, don’t-know, resume thread, quota 429 + billing link
- No widget embed, no Stripe Checkout
- Lint/build were green when 09 shipped

## Next session starts with

**10 Embed snippet + preview** — copy-paste script on bot detail; optional `/w/[publicId]` preview. Then 11 public widget API + `widget.js`.

## Open questions

- None blocking 10.
