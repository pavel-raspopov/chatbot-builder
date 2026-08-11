---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["route:/","components/landing/Hero.tsx","components/landing/Pricing.tsx","route:/login","route:/signup"]
---

# Surface: Marketing landing (`/`)

**Mode:** Persuade  
**Primary target:** `app/page.tsx`  
**Related:** `components/landing/*`, live auth routes (`/login`, `/signup`)

## Visitor success

A SaaS founder/PM believes DocuChat can turn their docs into a grounded bot and chooses **Start free** (or sees pricing first).

## First viewport

One composition only:

1. Brand wordmark **DocuChat** (hero-level, Literata, accent)
2. One headline (docs-grounded support — not generic “AI chatbot”)
3. One supporting sentence (upload PDFs/Markdown → in-app + embed)
4. CTA group: Start free (primary) + See pricing (secondary)
5. Dominant product visual: `HeroChatMock` (decorative chat UI)

No stats, logos, testimonials, or card collages in the hero.

## Section path

Nav → Hero → Features (upload / grounded chat / embed) → Pricing (Free/Pro/Business from `lib/plans.ts`) → Final CTA → Footer.

## Claims policy

Honest product capabilities only. Stripe called out as test mode on pricing. No fabricated social proof.

## Visual inheritance

Follows global DESIGN.md (“Calm Documentation Desk”). Do not invent a second marketing aesthetic.
