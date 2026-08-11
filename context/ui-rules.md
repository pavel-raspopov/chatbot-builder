# UI Rules

Concise rules for building DocuChat UI. Prefer design assets in `context/designs/` when present. Keep the product focused, calm, and usable — marketing landing first, then dense but clear app chrome.

---

## Fonts

Import via `next/font/google` in the root layout:

- **Public Sans** → `--font-sans` (UI, body)
- **Literata** → `--font-display` (hero + page titles)

Apply font variable classes on `<html>`. Never use Inter, IBM Plex, or system fonts as the primary UI face.

---

## Layout

- Landing content max-width ~1120px, centered
- App content max-width 1440px, centered
- App main padding: 24–32px
- Header height ~64px, full width, `bg-surface` / subtle bottom border
- Top navbar only — no sidebar in MVP

---

## Navbar (app)

Items: Dashboard, Bots, Billing (+ user/sign out).

- Active: `text-accent`, font-medium
- Inactive: `text-text-secondary`
- No underline — color change only

---

## Landing

- One clear hero composition: brand, one headline, one supporting sentence, one CTA group, one dominant visual (product UI or atmosphere — not a card collage)
- Features section: one job per section
- Pricing: Free / Pro / Business with gated features matching `PRODUCT.md`
- Do not fabricate fake user counts, logos, or testimonials; honest product claims only
- Avoid generic AI-purple gradients and Inter-only stacks

---

## Cards and controls

- Cards: `bg-surface border border-border rounded-lg p-6 shadow-card`
- Buttons/inputs: `rounded-md`
- Prefer no decorative cards in the hero
- Cards allowed when they contain interaction (pricing CTAs, bot list items, chat panels)

---

## Chat UI

- Familiar ChatGPT-like thread: messages stacked, composer sticky bottom
- Assistant vs user visually distinct using tokens only
- Empty state when bot has no ready documents
- Show streaming / loading state clearly

---

## Widget

- Floating launcher bottom-right on customer sites
- Panel readable on light marketing pages
- Free plan: visible “Powered by DocuChat” footer in panel

---

## Motion

- Prefer subtle presence (fade/slide on landing sections, composer focus) — not noise
- Respect `prefers-reduced-motion` when adding animation

---

## Accessibility

- Sufficient contrast on accent/text
- Form labels always present
- Icon-only buttons need `aria-label`
- Focus rings use `focus:ring-accent`

---

## Consistency

Before building a component, read `ui-registry.md`. After building, run `/imprint` and update the registry.
