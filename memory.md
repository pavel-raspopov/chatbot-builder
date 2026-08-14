# Memory — 13 Polish (review + viewport + centering)

Last updated: 2026-08-14 (evening)

## What was built

- Feature-review of phases 3–5 + overall vs `project-brief.md`; then Important fixes plus favicon
- Widget preview copy: live replies (no “not connected yet”) — `app/w/[publicId]/page.tsx`
- Chat persist: retrieve first, then quota, then persist user+assistant after a successful stream (`app/api/chat/route.ts`, `app/api/widget/chat/route.ts`)
- In-app chat viewport: `AppShell` uses `h-dvh overflow-hidden` on `/bots/[id]/chat`, hides footer, navbar `shrink-0`; only the message list scrolls
- Route `loading.tsx` / `error.tsx` / `not-found.tsx` via `RouteLoading`, `RouteError`, `RouteNotFound`
- Favicon `app/icon.svg` (forest square, white D)
- Operate columns `mx-auto max-w-2xl` (dashboard, bots, new, detail, billing) to match chat centering

## Decisions made

- No new features, no test runner, no seed demo bot
- Skipped remaining Minors (clipboard alert, stripe listen hint, mobile Features/Pricing in landing nav, SSE `{ success }` envelope)
- `/impeccable document` not needed — tokens/fonts/visual world unchanged; registry + ui-rules updated instead
- Chat height contract is `h-dvh` on the shell, not `min-h-dvh` and not `calc(100dvh-…)` on the thread

## Problems solved

- First chat-scroll fix hid the footer but left `min-h-dvh`; page still grew. Root cause: `min-h-dvh` is a floor; nested `flex-1 min-h-0` needs a definite `h-dvh overflow-hidden` ancestor
- `body` `overflow-x-hidden` computes `overflow-y: auto`, so an unbounded shell shows a second scrollbar

## Current state

- Phase 6 item 13 complete. User verified chat (no page scroll), operate centering, main workflow
- Item 14 Presentation is next (screenshare + voiceover)
- Stripe/Gemini/Supabase keys stay in `.env.local` only

## Next session starts with

**14 Presentation** — record signup → upload → in-app chat → embed preview → Stripe test upgrade

## Open questions

- None blocking 14

## Tests / TDD

- No test runner. Verify with `npm run lint`, `npm run build`, and a manual click-through
- Do not edit shared `lib/` (`rag`, `usage`, Gemini, Supabase clients) unless the feature plan lists them
