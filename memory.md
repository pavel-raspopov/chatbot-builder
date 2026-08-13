# Memory — 10 Embed snippet + preview

Last updated: 2026-08-13 (evening)

## What was built

- Bot detail Embed section: `components/bots/EmbedSnippet.tsx` (copy snippet + Preview)
- `public/widget.js` — vanilla launcher (floating button + iframe); no chat API
- Public `/w/[publicId]` fake-site preview and `/w/[publicId]/embed` panel (`WidgetPanel`)
- RPC `get_bot_widget_config(p_public_id)` — anon-safe; returns name, welcome, `remove_branding` only
- `lib/widget/getBotConfig.ts`, `lib/app-url.ts` (`NEXT_PUBLIC_APP_URL`, fallback `http://localhost:3000`)
- Embed route CSP `frame-ancestors *` in `next.config.ts`
- Surfaces: `.impeccable/surfaces/embed.md`; DESIGN.md Embed widget section (merged, not full overwrite)

## Decisions made

- Stub script now, live answers in 11
- Iframe panel (React/tokens) instead of Shadow DOM; launcher stays vanilla JS
- Public bot lookup via SECURITY DEFINER RPC, not service role (local `.env.local` has no service role)
- No branding toggle in 10 — badge follows `remove_branding` (default false)
- Launcher may copy token hex into `widget.js`; iframe panel uses token classes only
- Cross-origin local test is supported: paste snippet into another app on a different port while DocuChat runs on 3000

## Problems solved

- Owner-only RLS on `bots` blocked public preview SELECT — RPC instead of admin client
- `npm run build` failed on `thinkingLevel: "minimal"` vs SDK enum — set `ThinkingLevel.MINIMAL` in `lib/gemini.ts` (type-only; not a chat behavior change)

## Current state

- Phase 4 item 10 complete; user verified chrome looks fine
- Widget shows welcome + disabled composer; no `/api/widget/chat`, no quota on embed
- Snippet `src` is absolute via `getAppOrigin()`; preview page loads relative `/widget.js`
- Lint/build green when 10 shipped

## Next session starts with

**11 Public widget API + script** — `POST /api/widget/chat` (CORS, rate limits, same RAG as in-app), wire the panel composer, persist `source=widget` conversations. Then 12 Stripe.

## Open questions

- None blocking 11.

## 2026-08-13 — Tests / TDD

- No test runner until Phase 6. Verify with `npm run lint`, `npm run build`, and a manual click-through.
- TDD waived. Do not edit shared `lib/` (`rag`, `plans`, `usage`, Supabase clients) unless the feature plan lists them. A one-line type/compile fix in frozen code is allowed if the named verify command fails on it.
