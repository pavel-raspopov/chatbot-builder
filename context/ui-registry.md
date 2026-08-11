# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then add it here

After building any component — update this file with the component name, file path, and exact classes used. Run `/imprint`.

---

## Components

_No components captured yet._ Scaffold the Next.js app, then register Navbar, landing sections, chat, and billing UI here as they ship.

---

## Button Standard

Primary / secondary patterns live in `ui-tokens.md`. Do not invent a third button radius or padding without updating tokens + this registry.

## Card Standard

Use the Card pattern from `ui-tokens.md` (`bg-surface border border-border rounded-lg p-6 shadow-card`). Elevation is `shadow-card` — never arbitrary shadow classes.

## Focus State Standard

Interactive controls: `focus:outline-none focus:ring-1 focus:ring-accent`.
