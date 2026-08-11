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

# Design

Seed system for **DocuChat** (pre-implementation). Normative tokens live in the frontmatter and `context/ui-tokens.md`. Re-run `/impeccable document` after the first real UI ships so this file reflects built reality.

## Overview

DocuChat is a SaaS docs-support product: upload knowledge → grounded answers in-app and via embed. The visual world is a **calm documentation desk** — cool paper field, one forest accent, Literata for reading authority, Public Sans for UI chrome. Marketing (Persuade) and app (Operate) share the same atoms; landing may use larger display type and more whitespace, the app stays denser and quieter.

Strategy: **Restrained** neutrals + one accent. Light mode only for MVP.

## Colors

| Role | Token | Hex | Use |
| --- | --- | --- | --- |
| Page | `background` | `#eef2ef` | App/marketing page ground |
| Surface | `surface` | `#f7faf8` | Cards, panels, nav |
| Accent | `accent` | `#1f6b4f` | Primary CTAs, active nav, links |
| Ink | `text-primary` | `#14241f` | Headings and body |
| Muted | `text-muted` | `#6d7f76` | Meta, captions |
| Border | `border` | `#c5d0c9` | Dividers, inputs, cards |

Semantic: `success` shares the accent green; `warning`, `error`, and `info` are functional only — never decorative fills on marketing.

Do not introduce purple, neon glow, or warm cream + terracotta “AI SaaS” defaults.

## Typography

- **Literata** — display and page titles (docs / reading culture).
- **Public Sans** — UI, body, labels (documentation-system workhorse).

Wire both via `next/font/google` into `--font-display` and `--font-sans`. Never use Inter or IBM Plex as the primary face.

## Layout

- Landing content max-width ~1120px; app shell ~1440px.
- Section rhythm on landing ~64–96px; app padding 24–32px.
- Top navbar only — no sidebar in MVP.
- One composition in the first landing viewport: brand, one headline, one supporting line, one CTA group, one dominant product visual.

## Elevation & Depth

Prefer tonal separation (`surface` on `background`) over heavy shadow. When elevation is needed, use a single soft card shadow (`0 1px 2px` + `0 8px 24px` at low ink opacity). No multi-layer glow stacks.

## Shapes

Two-tier radius only: **controls** `8px` (`rounded.md`), **cards/panels** `16px` (`rounded.lg`). Do not invent a third tier without updating tokens.

## Components

- **Primary button** — accent fill, inverse text, `rounded-md`, `px-4 py-2`.
- **Secondary button** — surface fill, border, primary text.
- **Card** — surface, border, `rounded-lg`, `p-6`, optional `shadow-card`.
- **Input** — same radius as buttons; focus ring `accent`.
- **Chat** — stacked bubbles; assistant vs user distinguished by surface/secondary tones, not rainbow accents.
- **Widget** — floating launcher; Free plan shows “Powered by DocuChat”.

Register concrete class strings in `context/ui-registry.md` as components ship (`/imprint`).

## Do's and Don'ts

**Do**

- Use token utilities only (`bg-accent`, `text-text-primary`, …).
- Prefer “I don’t know from your docs” empty/error honesty in UI copy.
- Keep marketing claims tied to real product capabilities.

**Don't**

- Hardcode hex or raw Tailwind palette classes (`bg-emerald-600`, `text-gray-500`).
- Fabricate testimonials, logos, or user counts.
- Add purple gradients, glassmorphism stacks, or pill-stat strips in the hero.
- Split landing and app into unrelated visual languages.
