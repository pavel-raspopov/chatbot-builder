# UI Tokens

Design tokens for **DocuChat**. Normative companion to root `DESIGN.md`. Never hardcode colors or use raw Tailwind palette classes in components.

---

## How to Use

This project targets **Tailwind CSS v4**. Define tokens with `@theme` in `app/globals.css`.

```tsx
// Correct
className="bg-surface text-text-primary border-border"

// Never — hardcoded hex
className="bg-[#eef2ef]"

// Never — raw Tailwind palette
className="bg-emerald-600 text-gray-600"
```

---

## Direction

Calm documentation desk — cool paper field, one forest accent. **Literata** for display; **Public Sans** for UI/body. Shared atoms for landing (Persuade) and app (Operate).

---

## globals.css — Token Definition

```css
@import "tailwindcss";

@theme {
  /* Fonts — next/font sets --font-public-sans / --font-literata on <html> */
  --font-sans: var(--font-public-sans), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-literata), ui-serif, Georgia, serif;

  /* Page and surfaces */
  --color-background: #eef2ef;
  --color-surface: #f7faf8;
  --color-surface-secondary: #e4ebe6;
  --color-surface-tertiary: #d7e0db;
  --color-overlay-dark: #14241f;

  /* Borders */
  --color-border: #c5d0c9;
  --color-border-muted: #b3c0b8;

  /* Text */
  --color-text-primary: #14241f;
  --color-text-secondary: #4a5c55;
  --color-text-muted: #6d7f76;
  --color-text-inverse: #f7faf8;

  /* Accent — forest */
  --color-accent: #1f6b4f;
  --color-accent-dark: #15523c;
  --color-accent-light: #d8efe4;
  --color-accent-muted: #eef7f2;
  --color-accent-foreground: #f7faf8;

  /* Semantic */
  --color-success: #1f6b4f;
  --color-success-light: #d8efe4;
  --color-warning: #b8750e;
  --color-warning-light: #f5e6d0;
  --color-error: #b42318;
  --color-error-light: #fce8e6;
  --color-info: #1d4e89;
  --color-info-light: #e5eef8;

  /* Radii */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;

  /* Shadow */
  --shadow-card: 0 1px 2px rgb(20 36 31 / 0.06), 0 8px 24px rgb(20 36 31 / 0.06);
}
```

---

## Typography Scale

| Role | Font | Size / weight |
| --- | --- | --- |
| Display / hero | `--font-display` | clamp 40–56px, semibold |
| Page title | `--font-display` | 28–32px, semibold |
| Section title | `--font-sans` | 20–24px, semibold |
| Body | `--font-sans` | 16px, regular |
| Small / meta | `--font-sans` | 14px, medium |
| Caption | `--font-sans` | 12px, medium |

---

## Spacing

- Page max width: 1120px marketing, 1440px app
- Section vertical rhythm: 64–96px on landing
- App content padding: 24–32px
- Card padding: 24px (`p-6`)
- Control height target: ~40px (`py-2 px-4`)

---

## Component Tokens

| Element | Classes (token-based) |
| --- | --- |
| Card | `bg-surface border border-border rounded-lg p-6 shadow-card` |
| Primary button | `rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark` |
| Secondary button | `rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary` |
| Input | `w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent` |

Two-tier radius: cards `rounded-lg`; controls `rounded-md`.
