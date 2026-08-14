# Memory — 14 Presentation (Video 1 submitted)

Last updated: 2026-08-14 (late evening)

## What was built

- Demo pack: `docs/demo/README.md`, `docs/demo/video-1-product-script.md`, `docs/demo/video-2-technical-script.md`, `docs/demo/northwind-desk-faq.md`
- Root `README.md` for GitHub (product, stack, local setup — no Demo notes / HR open points)
- Local `docuchat-product-demo.mp4` stays on disk, gitignored, not in git history
- Item 14 Video 1 (product demo) recorded by Pavel and sent to HR with a short Russian note
- Progress tracker / build-plan: 14 checked; Video 2 left as an open point

## Decisions made

- Two videos: Video 1 is the brief deliverable; Video 2 only if they ask
- Record Video 1 silent then voiceover (Clipchamp); Video 2 in OBS if needed
- Windows Snipping Tool / Game Bar do not capture the front camera
- Public README stays product-only; demo scripts can live in `docs/demo/` but not as GitHub landing copy
- Do not commit mp4 recordings; rewrite history if one lands in a commit before push
- No app feature work after Video 1 submit; waiting on HR

## Problems solved

- Built-in Windows capture is screen + mic only, not webcam (user meant screen recorder, not screensaver)

## Current state

- MVP complete (phases 1–6). Video 1 submitted. Waiting on the hiring result.
- Video 2 not recorded. Script is ready.
- Keys stay in `.env.local` only. Do not show them on camera.

## Next session starts with

**Open point — Video 2**, only if HR asks for a technical follow-up:

1. Open `docs/demo/video-2-technical-script.md`
2. OBS: app + terminals, Supabase tables (no API keys), Gemini via chat UI, Stripe test Dashboard, brief + `lib/plans.ts`
3. Hide webhook secrets and `.env.local`
4. Export `docuchat-technical.mp4`

If they do not ask: nothing to build. Do not add features unless they request changes.

## Open questions

- Whether HR wants Video 2 or a live demo

## Tests / TDD

- No test runner. Verify with `npm run lint`, `npm run build`, and a manual click-through
