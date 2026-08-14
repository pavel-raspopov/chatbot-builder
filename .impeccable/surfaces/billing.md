---
version: 1
slug: "billing"
primary_target: "app/(app)/settings/billing/page.tsx"
related_targets: ["components/billing/BillingActions.tsx", "components/ui/UsageMeter.tsx", "components/dashboard/DashboardOverview.tsx", "lib/plans.ts", "route:/settings/billing"]
---

# Surface: Billing (`/settings/billing`)

**Mode:** Operate  
**Primary target:** `app/(app)/settings/billing/page.tsx`

## Visitor success

See current plan, usage (bots, messages, storage), and upgrade or manage in Stripe test mode. Upgrade CTAs from dashboard, bots, and upload land here. Missing Stripe keys show honest setup copy — the plan is never written from the client.

## Composition

App shell. `max-w-2xl`. Title + plan badge, test-mode body copy, checkout status, three `UsageMeter`s, `BillingActions` (Checkout / Portal), email, secondary Back to dashboard. No cards.

## Visual inheritance

`DESIGN.md` + Dashboard overview / Usage meter / Billing registry entries. Same operate type and meters as the dashboard.
