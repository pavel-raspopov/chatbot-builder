# Memory — Landing page (01) + design imprint

Last updated: 2026-08-11 (afternoon)

## What was built

- Next.js 16 App Router scaffold at repo root (Tailwind v4 `@theme`, Literata + Public Sans, no `src/`)
- Marketing landing at `/`: `LandingNav`, `Hero` + `HeroChatMock`, `Features`, `Pricing`, `FinalCta`, `LandingFooter`
- Shared `components/ui/Button.tsx`; plan gates in `lib/plans.ts` (Free/Pro/Business)
- Stub auth pages: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`
- `.env.example` (placeholders only; no Supabase/Gemini/Stripe SDKs installed)
- Design carbonization: refreshed `DESIGN.md`, `.impeccable/design.json`, landing surface brief `.impeccable/surfaces/app-page-tsx.md`
- `context/ui-registry.md` baseline + imprint tables; synced `ui-rules.md`, `ui-tokens.md`, `library-docs.md`, `progress-tracker.md` (01 done)

## Decisions made

- First finished slice = landing + minimal scaffold; Auth deferred to 02
- Scaffold via temp dir then merge — never overwrite existing `AGENTS.md` / context with create-next-app output
- Pricing CTAs and nav auth links hit stubs until Supabase Auth lands
- ESLint ignores `.agents/`, `.cursor/`, `skill-observations/`, `context/` so lint covers app source only

## Problems solved

- Nonempty-repo `create-next-app`: scaffold in `docuchat-tmp/`, move runtime files up, discard generator docs
- Lint noise from skill tooling fixed via `eslint.config.mjs` `globalIgnores`

## Current state

- `npm run build` and `npm run lint` pass
- Landing and stubs work; no auth, DB, RAG, widget, or Stripe yet
- Task-observer review 2026-08-11: observations #1–#2 ACTIONED; staged skill updates under `skill-updates/2026-08-11-*` (not installed into live skills yet)

## Next session starts with

**02 Auth** — install Supabase clients (`lib/supabase/client.ts`, `server.ts`), email/password forms on `/login` + `/signup`, session middleware/proxy for protected routes, redirect to `/dashboard` (can be minimal placeholder), replace stub copy. Read `context/library-docs.md` Supabase section and Next docs under `node_modules/next/dist/docs/` (note possible `proxy` vs middleware naming on Next 16).

Optional before coding: install staged skill updates from `skill-updates/2026-08-11-executing-plans` and `skill-updates/2026-08-11-imprint` into `.agents/skills/` if you want those rules live.

## Open questions

- None blocking Auth. Confirm email/password only for MVP (OAuth optional later) when starting 02.
