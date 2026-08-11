---
version: 1
slug: "auth"
primary_target: "app/(auth)/login/page.tsx"
related_targets:
  [
    "route:/login",
    "route:/signup",
    "components/auth/LoginForm.tsx",
    "components/auth/SignupForm.tsx",
    "components/ui/Input.tsx",
    "actions/auth.ts",
  ]
---

# Surface: Auth gates (`/login`, `/signup`)

**Mode:** Operate  
**Primary target:** `app/(auth)/login/page.tsx`  
**Related:** signup page, auth forms, `Input`, Server Actions

## Visitor success

Create an account or sign in with email/password and reach `/dashboard` with a session.

## Composition

One quiet column — not a marketing hero:

1. Brand **DocuChat** (Literata, `text-accent`)
2. Page title (Log in / Start free)
3. One supporting sentence
4. Email + password form (`Input` + primary `Button`)
5. Cross-link + secondary Back to home

No OAuth buttons, cards, or promotional chrome.

## Claims policy

Honest auth only. If signup returns no session (confirm-email on), show a clear check-email message — do not fake success.

## Visual inheritance

Same atoms as `DESIGN.md`. Gate layout patterns live in `context/ui-registry.md` (Auth pages + Input).
