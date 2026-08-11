---
version: 1
slug: "dashboard"
primary_target: "app/(app)/dashboard/page.tsx"
related_targets: ["route:/dashboard", "actions/auth.ts"]
---

# Surface: Dashboard placeholder (`/dashboard`)

**Mode:** Operate  
**Primary target:** `app/(app)/dashboard/page.tsx`

## Visitor success

Confirm they are authenticated (see email) and can sign out. Full dashboard metrics/bots arrive in features 04–05.

## Composition

Same gate rhythm as auth (`max-w-lg`): brand, title, short status line, secondary Sign out + Home. No app shell navbar yet (04).

## Visual inheritance

`DESIGN.md` + Auth pages registry entry. Do not invent a second app aesthetic here.
