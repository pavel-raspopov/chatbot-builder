# Memory — Phase 2 hardening + chrome fixes

Last updated: 2026-08-13 (afternoon)

## What was built

- Phase 2 review fixes: `updateBot` + `EditBotForm`; `deleteBot` Storage API `remove` before row delete; pending Retry; ingest 409 unless `force`; billing usage page (no Stripe); documents column lock (`status`/`error` only) applied remotely as `protect_documents_quota_columns`
- Chrome: app nav wraps from 300px; dropzone drag accent stays over center (`pointer-events-none`); links/buttons use `focus-visible` (no green ring after mouse click)
- Docs: `code-standards.md`, `library-docs.md`, `architecture.md`, `ui-registry.md`, `DESIGN.md` (merged), surfaces `bots.md` + `billing.md`

## Decisions made

- Plan numbers stay in Server Actions (`lib/plans.ts`); RLS is ownership; column privileges lock quota fields — no SQL plan-limit triggers
- Image-only PDF: UI error is enough; browser Network 500 is normal; keep server `ExtractError` logs; no extra client `console.error`
- Billing page shows plan + meters only until phase 12 Checkout

## Problems solved

- Narrow widths (~400px): one-row nav overflow made header/footer/main backgrounds look gapped — wrap + `overflow-x-hidden`
- Dropzone accent died over center text because `dragleave` fired on children
- Mouse click left `focus:ring-accent` on `<a>` — switched links/buttons to `focus-visible`

## Current state

- Phase 2 complete through 08 + hardening; user verified UI looks fine
- Remote column lock is live; lint was green after chrome fixes
- No in-app chat, widget, or Stripe Checkout

## Next session starts with

**09 In-app chat UI** — ChatGPT-like thread on `/bots/[id]/chat`; then `lib/rag/retrieve.ts` + `/api/chat`

## Open questions

- None blocking 09.
