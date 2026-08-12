# Memory — 06 Bots list + create

Last updated: 2026-08-12 (evening)

## What was built

- **06 Bots list + create:** `actions/bots.ts` (`createBot` with plan bot limit + redirect; `deleteBot`); `components/bots/BotsList.tsx`, `CreateBotForm.tsx`; `components/ui/Textarea.tsx`
- **Routes:** `app/(app)/bots/page.tsx` (list), `bots/new/page.tsx` (form or at-limit upgrade), `bots/[id]/page.tsx` (read-only stub for 07)
- **Dashboard CTA:** Create bot → `/bots/new`
- **Docs:** `.impeccable/surfaces/bots.md`, ui-registry (Textarea, Bots list, Create form, detail stub), progress-tracker / build-plan (06 done, next 07), ui-rules (`max-w-2xl` for bots)

## Decisions made

- Real Supabase in one session (not mock-first); same pattern as 05
- CRUD in 06 = create + list + delete; field edit deferred to 07 bot detail
- Create uses `useActionState` + redirect; delete uses result-object action + `revalidatePath`
- Plan bot limits enforced in UI and Server Action via `getPlanLimits`

## Problems solved

- None blocking; Free create → stub → second create blocked → delete verified by developer

## Current state

- Phase 2; **06 complete**; lint/build green
- Bots list/create/delete work under RLS; Free limit (1 bot) gated
- Bot detail is stub only (no upload yet); billing still stub

## Next session starts with

**07 Bot detail — docs upload** — dropzone, document list with status, delete; upload to Storage; create `documents` row; enforce storage quota.

## Open questions

- None blocking 07.
