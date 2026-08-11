---
name: DocuChat
description: Calm docs-support product — forest accent on cool paper, Literata + Public Sans.
colors:
  background: "#eef2ef"
  surface: "#f7faf8"
  surface-secondary: "#e4ebe6"
  surface-tertiary: "#d7e0db"
  overlay-dark: "#14241f"
  border: "#c5d0c9"
  border-muted: "#b3c0b8"
  text-primary: "#14241f"
  text-secondary: "#4a5c55"
  text-muted: "#6d7f76"
  text-inverse: "#f7faf8"
  accent: "#1f6b4f"
  accent-dark: "#15523c"
  accent-light: "#d8efe4"
  accent-muted: "#eef7f2"
  accent-foreground: "#f7faf8"
  success: "#1f6b4f"
  success-light: "#d8efe4"
  warning: "#b8750e"
  warning-light: "#f5e6d0"
  error: "#b42318"
  error-light: "#fce8e6"
  info: "#1d4e89"
  info-light: "#e5eef8"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  sm: "6px"
  md: "8px"
  lg: "16px"
  xl: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.accent-foreground}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    typography: "{typography.label}"
---

# Design System: DocuChat

## Overview

**Creative North Star: "The Calm Documentation Desk"**

DocuChat’s visual world is a quiet product-docs workspace: cool paper field, one forest accent, Literata for reading authority, Public Sans for UI chrome. Marketing (Persuade) and the future app (Operate) share the same atoms — landing may breathe more; the app stays denser and quieter. Light mode only for MVP.

Strategy: **restrained** neutrals + one accent. Depth comes from tonal layers first, then a single soft card shadow when interaction needs lift. No purple-AI gradients, neon glow, or warm cream + terracotta defaults.

**Key Characteristics:**

- Cool paper page ground with forest accent CTAs
- Literata display + Public Sans UI (never Inter as primary)
- Two-tier radius: controls 8px, cards/panels 16px
- Token utilities only — hex lives in `@theme`, not in components
- Honest marketing: no fake metrics, logos, or testimonials

## Colors

A cool, desaturated paper palette with a single forest primary. Semantic warning/error/info exist for functional UI only — never as decorative marketing fills.

### Primary

- **Forest** (`accent` `#1f6b4f`): primary CTAs, active links, recommended plan ring, brand emphasis on marketing wordmark accents
- **Forest Deep** (`accent-dark` `#15523c`): primary button hover
- **Mist Green** (`accent-light` `#d8efe4` / `accent-muted` `#eef7f2`): soft hero atmosphere and quiet bands (final CTA)

### Neutral

- **Cool Paper** (`background` `#eef2ef`): page ground
- **Desk Surface** (`surface` `#f7faf8`): nav, cards, panels
- **Ink** (`text-primary` `#14241f`): headings and primary body
- **Slate Green** (`text-secondary` `#4a5c55`): supporting copy
- **Moss Mute** (`text-muted` `#6d7f76`): meta, captions, placeholders
- **Leaf Edge** (`border` `#c5d0c9`): dividers, card strokes, inputs

### Named Rules

**The One Accent Rule.** Forest is the only brand accent. Do not introduce a second decorative hue on marketing or app chrome.

**The Token-Only Rule.** Components use Tailwind token utilities (`bg-accent`, `text-text-primary`, `border-border`). Never hardcode hex or raw palette classes (`bg-emerald-600`, `text-gray-500`).

## Typography

**Display Font:** Literata (Georgia fallback)  
**Body Font:** Public Sans (ui-sans-serif, system-ui fallback)

**Character:** Docs-desk pairing — Literata carries reading authority for brand and heroes; Public Sans handles chrome, body, and labels with calm documentation energy.

### Hierarchy

- **Display** (600, `clamp(2.5rem, 5vw, 3.5rem)`, 1.15): landing hero headline
- **Headline** (600, ~2rem–2.25rem Literata): marketing section titles
- **Title** (600, ~1.25rem Public Sans): card titles, feature titles
- **Body** (400, 1rem, 1.55): paragraphs; measure ~65–75ch where practical
- **Label** (500, 0.875rem): buttons, nav, form labels
- **Caption** (500, 0.75rem): meta chrome (chat mock header, badges)

### Named Rules

**The No-Inter Rule.** Never use Inter, IBM Plex, or system UI as the primary face. Wire Literata → `--font-literata` / Public Sans → `--font-public-sans` via `next/font`; `@theme` maps `--font-display` and `--font-sans`.

**The No-Eyebrow Rule.** Do not put a kicker/eyebrow above a heading. Brand and headline carry the weight.

## Layout

- Marketing content: `max-w-[1120px]` centered, horizontal `px-6`
- App content (future): max ~1440px, main padding 24–32px
- Marketing header: sticky `h-16`, `bg-surface/95`, bottom `border-border`
- Landing section rhythm: `py-20 sm:py-24` (~80–96px)
- Top navbar only — no sidebar in MVP
- Hero first viewport: one composition — brand, one headline, one supporting line, one CTA group, one dominant product visual (chat mock)

### Named Rules

**The One-Composition Hero Rule.** First viewport must read as a single composition. No stats strips, testimonial chips, logo walls, or card collages in the hero.

## Elevation & Depth

Prefer tonal separation (`surface` on `background`, `surface-secondary` chrome) over heavy shadow. Interactive cards may use the single soft **card** shadow.

### Shadow Vocabulary

- **Card** (`shadow-card` = `0 1px 2px rgb(20 36 31 / 0.06), 0 8px 24px rgb(20 36 31 / 0.06)`): pricing cards, chat mock panel — never invent alternate shadow stacks

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Use `shadow-card` only when a container holds interaction or is a primary product visual.

## Shapes

Two-tier radius only:

- **Controls** — gently curved edges (`rounded-md` / 8px): buttons, inputs, chat bubbles, composer
- **Cards / panels** — softer panels (`rounded-lg` / 16px): pricing cards, chat mock shell

Borders are 1px token strokes (`border-border`). Highlighted pricing may add `ring-1 ring-accent`.

### Named Rules

**The Two-Radius Rule.** Do not invent a third radius tier without updating tokens + registry.

## Components

### Buttons

Quiet, confident controls — forest fill for the primary action, paper + border for secondary.

- **Shape:** control radius (8px)
- **Primary:** `bg-accent` + `text-accent-foreground`, `px-4 py-2`, `text-sm font-medium`; hover `bg-accent-dark`
- **Secondary:** `bg-surface` + `border-border` + `text-text-primary`; hover `bg-surface-secondary`
- **Focus:** `focus:outline-none focus:ring-1 focus:ring-accent`
- **API:** `components/ui/Button.tsx` — `href` renders `Link`, else `<button>`

### Cards / Containers

- **Corner:** panel radius (16px)
- **Background:** `bg-surface`
- **Border:** `border border-border` (highlighted plan: `border-accent ring-1 ring-accent`)
- **Shadow:** `shadow-card` when interactive
- **Padding:** `p-6`

### Inputs / Fields (token standard; not fully built)

- Surface fill, border, control radius, `px-3 py-2`, focus ring accent (see `ui-tokens.md`)

### Navigation (marketing)

- Sticky surface bar with subtle blur; Literata wordmark; Public Sans links `text-text-secondary` → hover/active `text-accent`
- Primary CTA in nav is the shared Button

### Chat (marketing mock + future app)

- Stacked bubbles; user on `bg-accent-muted`; assistant on `bg-surface-secondary` + border — not rainbow accents
- Composer row: bordered surface field + accent send control

### Pricing

- Three interactive cards from `lib/plans.ts`; Pro highlighted; CTAs → signup
- Allowed card use: they contain plan CTAs

## Do's and Don'ts

### Do

- **Do** use token utilities from `app/globals.css` / `context/ui-tokens.md` only.
- **Do** read `context/ui-registry.md` before building; run `/imprint` after.
- **Do** keep marketing claims tied to real product capabilities.
- **Do** prefer “I don’t know from your docs” honesty in empty/error copy.
- **Do** honor `prefers-reduced-motion` for landing motion (`.animate-fade-up`, `.animate-hero-mock`).

### Don't

- **Don't** hardcode hex or raw Tailwind palette classes in components.
- **Don't** fabricate testimonials, logos, or user counts.
- **Don't** add purple gradients, glassmorphism stacks, or pill-stat strips in the hero.
- **Don't** split landing and app into unrelated visual languages.
- **Don't** use accent-colored thick left borders as decorative section markers.
