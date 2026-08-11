---
version: 1
slug: "dashboard"
primary_target: "app/(app)/dashboard/page.tsx"
related_targets: ["route:/dashboard", "components/layout/AppNavbar.tsx", "components/layout/AppFooter.tsx", "app/(app)/layout.tsx"]
---

# Surface: Dashboard placeholder (`/dashboard`)

**Mode:** Operate  
**Primary target:** `app/(app)/dashboard/page.tsx`

## Visitor success

Confirm they are authenticated (see email) and can sign out from the app navbar. Full dashboard metrics/bots arrive in feature 05.

## Composition

App shell from `(app)/layout.tsx` (AppNavbar + content + AppFooter). Page body is title + signed-in status only — no duplicated brand or Sign out controls.

## Visual inheritance

`DESIGN.md` + AppNavbar / AppFooter registry entries. Content uses the same title/body rhythm as auth pages inside the shell main.
