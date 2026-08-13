---
version: 1
slug: "billing"
primary_target: "app/(app)/settings/billing/page.tsx"
related_targets: ["components/ui/UsageMeter.tsx", "components/dashboard/DashboardOverview.tsx", "lib/plans.ts", "route:/settings/billing"]
---

# Surface: Billing (`/settings/billing`)

**Mode:** Operate  
**Primary target:** `app/(app)/settings/billing/page.tsx`

## Visitor success

See current plan, usage (bots, messages, storage), and honest copy that Stripe Checkout is not live yet. Upgrade CTAs from dashboard, bots, and upload land here — not a blank stub.

## Composition

App shell. `max-w-2xl`. Title + plan badge, body copy, three `UsageMeter`s, email, secondary Back to dashboard. No cards. No Checkout buttons until phase 12.

## Visual inheritance

`DESIGN.md` + Dashboard overview / Usage meter / Billing registry entries. Same operate type and meters as the dashboard.
