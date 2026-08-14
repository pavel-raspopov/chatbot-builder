# Memory — 14 Presentation (Video 1 submitted) + skill review

Last updated: 2026-08-14 (night)

## What was built

- Demo pack in `docs/demo/`; root `README.md` is product-only (no Demo notes)
- Video 1 sent to HR; `docuchat-product-demo.mp4` on disk, gitignored, not in history
- Weekly skill review 2026-08-14: observations #3–#9, #11–#12 ACTIONED; live skills updated in `.agents/skills/` (feature-review, TDD, writing-plans, executing-plans). Staging copy: `skill-updates/2026-08-14/`

## Decisions made

- Video 2 only if HR asks (`docs/demo/video-2-technical-script.md`)
- Public README stays product-only
- Do not commit mp4s
- Remember skill: chained restore + next task still requires confirm (review skipped that change)
- No new `supabase-extras` skill this review

## Problems solved

- Windows screen capture is screen + mic, not webcam
- Accidental 95MB mp4 was rewritten out of git history before any push

## Current state

- MVP complete. Waiting on HR.
- Skills from the review are live. Observation #10 still OPEN (Supabase MCP `loading` ≠ `needsAuth`; plugin skill is read-only)

## Next session starts with

**Open point — Video 2**, only if HR asks: `docs/demo/video-2-technical-script.md`, OBS, no keys on camera, export `docuchat-technical.mp4`.

If they do not ask: nothing to build.

Optional later: user-owned `supabase-extras` for observation #10.

## Open questions

- Whether HR wants Video 2 or a live demo

## Tests / TDD

- No test runner. Verify with `npm run lint`, `npm run build`, and a manual click-through. Plan/project verify commands outrank the TDD iron law.
