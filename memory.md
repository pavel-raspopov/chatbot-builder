# Memory — 04 App shell + Phase 1 review fixes

Last updated: 2026-08-11 (evening)

## What was built

- **04 App shell:** `components/layout/AppNavbar.tsx`, `AppFooter.tsx`; `app/(app)/layout.tsx` shell (`max-w-[1440px]`); stubs `app/(app)/bots/page.tsx`, `settings/billing/page.tsx`; dashboard content-only (sign-out in nav)
- **Review fixes:** migration `supabase/migrations/20260811150008_protect_profiles_billing_columns.sql` (applied remote) — revoke client UPDATE on `profiles`; WITH CHECK locks plan/Stripe/usage
- Landing CTAs respect auth (`getClaims` on `app/page.tsx` → Dashboard / Manage billing)
- Auth actions: try/catch + `unstable_rethrow`; `signOut` logs errors then redirects
- App nav: Bots/Billing `hidden sm:inline` on narrow screens
- Docs: `code-standards.md` dual Server Action shapes; DESIGN/PRODUCT/ui-registry/architecture/library-docs/progress-tracker updated

## Decisions made

- Server Actions: CRUD → `{ success, error? }`; auth/`useActionState` forms → typed state + `redirect()` (do not force `{ success }` onto auth)
- Profiles billing fields: service_role only; no client UPDATE grants for authenticated/anon
- `admin.ts` still deferred until ingest/webhook
- Auth Confirm email remains a Supabase dashboard setting for local demo

## Problems solved

- Feature-review Critical: users could self-update `plan` / usage / Stripe ids via RLS — fixed with REVOKE + WITH CHECK
- code-standards vs Next.js forms: clarified two action patterns instead of rewriting auth to `{ success }`

## Current state

- Phase 1 complete (01–04); lint/build green
- App chrome works on `/dashboard`, `/bots`, `/settings/billing`
- Signed-in landing links to dashboard/billing

## Next session starts with

**05 Dashboard** — bot count, usage (messages), plan badge, empty states, CTA to create bot / upgrade (real data from `profiles` + bots under RLS).

## Open questions

- None blocking 05.
