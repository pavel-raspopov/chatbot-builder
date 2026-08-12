---
version: 1
slug: "dashboard"
primary_target: "app/(app)/dashboard/page.tsx"
related_targets: ["components/dashboard/DashboardOverview.tsx", "route:/dashboard", "components/layout/AppNavbar.tsx", "components/layout/AppFooter.tsx", "app/(app)/layout.tsx", "lib/plans.ts"]
---

# Surface: Dashboard (`/dashboard`)

**Mode:** Operate  
**Primary target:** `app/(app)/dashboard/page.tsx`

## Visitor success

See their plan, bot count, and monthly message usage from live profile data. When they have no bots, understand the next step (create a bot). Reach billing when on Free or at a limit.

## Composition

App shell from `(app)/layout.tsx`. Page body: title + plan badge, signed-in email, two usage meters (bots / messages), empty state when bot count is 0, CTA row (Create bot; Upgrade when relevant). No duplicated brand or Sign out controls.

## Visual inheritance

`DESIGN.md` + Dashboard overview registry entry. Content `max-w-2xl`; tokens only — no decorative cards.
