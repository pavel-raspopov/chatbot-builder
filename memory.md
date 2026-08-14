# Memory — 12 Pricing gates + Stripe test Checkout

Last updated: 2026-08-14 (evening)

## What was built

- Stripe test Checkout + Customer Portal via `actions/billing.ts` (`startCheckout`, `startPortal`); hosted Checkout redirect, no Stripe.js
- `POST /api/stripe/webhook` — `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → `applySubscriptionToProfile` (`lib/billing.ts`, service role)
- Billing page: test-mode copy, Upgrade to Pro/Business, Manage subscription, `?checkout=success|canceled`, setup copy if keys missing
- Branding checkbox on `EditBotForm`; `updateBot` forces off on Free; `get_bot_widget_config` returns effective branding (flag AND paid plan). Migration `widget_config_effective_branding` applied remotely
- `lib/plans.ts` `canRemoveBranding`; `stripe` package; `.env.example` has `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS`

## Decisions made

- Server Actions for Checkout/Portal; Route Handler only for the webhook (not `app/api/stripe/checkout`)
- Paid plan change/cancel goes through Portal so we never open a second subscription
- Never fake-write `profiles.plan` from the app. Missing keys → setup copy
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` unused (no Elements)
- Widget RPC still must not return `system_prompt` or `user_id`

## Problems solved

- Checkout `resource_missing` on `line_items[0][price]`: env had a Product ID (`prod_…`). Stripe Checkout needs a Price ID (`price_…`). User fixed `.env.local`; live flow then passed
- Ignore Stripe Dashboard wizards (Payment Links, Pricing tables, embedded Checkout). This app uses API-created hosted Checkout
- Local webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook` → `STRIPE_WEBHOOK_SECRET`; restart `npm run dev` after env changes

## Current state

- Phase 5 item 12 complete. User verified: Free → Pro (card 4242), webhook updates plan, second bot, branding hide, Portal cancel → Free
- Stripe test keys live only in `.env.local` (not git). Names: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`, `STRIPE_WEBHOOK_SECRET`
- Lint/build green. TDD still waived until Phase 6

## Next session starts with

**13 Polish** — empty states, error copy, loading, mobile landing/app, seed demo bot if useful.

## Open questions

- None blocking 13.

## Tests / TDD

- No test runner until Phase 6. Verify with `npm run lint`, `npm run build`, and a manual click-through
- Do not edit shared `lib/` (`rag`, `usage`, Gemini, Supabase clients) unless the feature plan lists them
