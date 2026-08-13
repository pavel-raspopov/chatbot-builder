# UI Rules

Concise rules for building DocuChat UI. Prefer design assets in `context/designs/` when present. Keep the product focused, calm, and usable — marketing landing first, then dense but clear app chrome.

Authoritative companions:

- Visual system narrative + tokens frontmatter → root [`DESIGN.md`](../DESIGN.md)
- Machine sidecar (panel snippets) → [`.impeccable/design.json`](../.impeccable/design.json)
- Exact class strings → [`ui-registry.md`](ui-registry.md)
- `@theme` source → [`ui-tokens.md`](ui-tokens.md) / `app/globals.css`

---

## Fonts

Import via `next/font/google` in the root layout:

- **Public Sans** → CSS variable `--font-public-sans`
- **Literata** → CSS variable `--font-literata`

Apply both variable classes on `<html>`. `@theme` maps:

- `--font-sans` → `var(--font-public-sans), …`
- `--font-display` → `var(--font-literata), …`

Use `font-display` for brand + marketing/page titles; body defaults to `font-sans`. Never use Inter, IBM Plex, or system fonts as the primary UI face.

---

## Layout

- Landing content max-width `max-w-[1120px]`, centered, `px-6`
- App content max-width ~1440px, centered
- App main padding: 24–32px
- Header height `h-16` (~64px), full width, `bg-surface` / `border-b border-border`
- Landing section rhythm: `py-20 sm:py-24`
- Top navbar only — no sidebar in MVP

---

## Navbar (marketing — shipped)

- Sticky: `sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm`
- Brand: Literata wordmark `font-display … text-text-primary`
- Links: `text-sm font-medium text-text-secondary hover:text-accent`
- Primary CTA: shared `Button` → Start free

## Navbar (app — shipped)

Items: Dashboard, Bots, Billing (+ Sign out).

- Active: `text-accent`, font-medium
- Inactive: `text-text-secondary`
- No underline — color change only
- Components: `components/layout/AppNavbar.tsx`, `AppFooter.tsx`
- All three nav items stay visible on narrow screens
---

## Auth / Operate gates (shipped)

- Centered column: auth `max-w-md` (`px-6 py-16`); app operate pages (dashboard, bots) `max-w-2xl` inside app main
- Brand wordmark Literata `text-accent`; title Literata `text-text-primary`; body `text-text-secondary`
- Forms: shared `Input` + `Button`; stack `gap-4`; errors `text-error` + `role="alert"`
- No OAuth chrome in MVP; no decorative cards on gate pages or dashboard meters
- Surface briefs: `.impeccable/surfaces/auth.md`, `.impeccable/surfaces/dashboard.md`
---

## Landing

- One clear hero composition: brand, one headline, one supporting sentence, one CTA group, one dominant visual (product UI mock — not a card collage)
- Features: stacked one-job blocks (not icon-card grids); no decorative accent left borders
- Pricing: Free / Pro / Business from `lib/plans.ts`; Pro highlighted with `border-accent ring-1 ring-accent`
- Closing band may use `bg-accent-muted`
- Do not fabricate fake user counts, logos, or testimonials; honest product claims only
- Avoid generic AI-purple gradients and Inter-only stacks
- Surface strategy for `/` also lives in `.impeccable/surfaces/` (landing brief)

---

## Cards and controls

- Cards: `bg-surface border border-border rounded-lg p-6 shadow-card`
- Buttons/inputs: `rounded-md`
- Prefer no decorative cards in the hero (the chat mock is the product visual, not a promo card stack)
- Cards allowed when they contain interaction (pricing CTAs, bot list items, chat panels)
- Focus (fields): `focus:outline-none focus:ring-1 focus:ring-accent`
- Focus (links / buttons): `focus:outline-none focus-visible:ring-1 focus-visible:ring-accent`

---

## Chat UI

- Familiar ChatGPT-like thread: messages stacked, composer sticky bottom
- User bubble: `bg-accent-muted` + `rounded-md`
- Assistant bubble: `bg-surface-secondary` + `border border-border` + `rounded-md`
- Empty state when bot has no ready documents
- Show streaming / loading state clearly
- Marketing mock: `components/landing/HeroChatMock.tsx` (match its tokens)

---

## Widget

- Floating launcher bottom-right on customer sites (`public/widget.js`)
- Panel is an iframe to `/w/[publicId]/embed` — tokens, welcome bubble, disabled composer until feature 11
- Free plan: visible “Powered by DocuChat” footer in panel
- Host-page launcher may copy token hex into inline CSS; iframe panel uses token classes only

---

## Motion

- Landing helpers in `app/globals.css`: `.animate-fade-up`, `.animate-fade-up-delay`, `.animate-hero-mock`
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — subtle presence, not noise
- Respect `prefers-reduced-motion` (already kills the helpers above)

---

## Accessibility

- Sufficient contrast on accent/text
- Form labels always present
- Icon-only buttons need `aria-label`
- Focus rings use `focus:ring-accent`
- Decorative product mocks: `aria-hidden="true"`

---

## Consistency

Before building a component, read `ui-registry.md` and `DESIGN.md`. After building, run `/imprint` and update the registry. After meaningful visual system changes, re-run `/impeccable document` so `DESIGN.md` + `.impeccable/design.json` stay aligned with code.
