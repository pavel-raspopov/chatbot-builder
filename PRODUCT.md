# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) + Supabase (Auth, Postgres, Storage, pgvector) + Gemini API + Stripe test mode + Tailwind CSS v4. Confirmed from `context/project-brief.md` and project architecture docs. Landing scaffold shipped; Auth/DB next.

## Users

Primary: founders, PMs, and support leads at small SaaS/product companies who already have docs (PDFs, Markdown, help articles) and want a support chatbot on their site without building RAG in-house.

Secondary audience: reviewers of this demo MVP — treat the product as if real users will use it tomorrow.

## Product Purpose

**DocuChat** turns uploaded company knowledge into a grounded chatbot. The bot is available as an in-app ChatGPT-like chat and as an embeddable website widget. Billing (Stripe test mode) gates bots, message volume, storage, and widget branding.

Success: a user can sign up, create a bot, upload docs, ask a question in-app, paste the embed snippet on a page, and see the same quality answers — then upgrade via Stripe test Checkout when they hit Free limits.

## Positioning

Launchable **product MVP / demo** for the Embeddable Chatbot Builder brief (`context/project-brief.md`). Not a toy CRUD app: focused scope, working RAG, real embed path, and a believable pricing story (test payments only — no live charges).

Niche: **SaaS / product docs support**, not generic “chat with any PDF” sprawl.

## Operating Context

- Backend: **Supabase** (Auth, Postgres, Storage, pgvector). Never InsForge.
- AI: **Google Gemini** for embeddings + chat (`GEMINI_API_KEY`). Not OpenAI.
- Billing: Stripe **test** mode; plans Free / Pro / Business.
- One owner per account; no team seats in MVP.
- Ingest: PDF + Markdown/text uploads (not full-site crawl).
- Widget answers only from that bot’s chunks.

## Capabilities and Constraints

In scope: landing (features + pricing), auth, dashboard, bots CRUD, doc upload + ingest, in-app chat, embeddable widget + public API, Stripe test billing + feature gates, polish suitable for a video demo.

Explicitly out of scope: multi-seat orgs, SSO, fine-tuning, live payments, mobile apps, browser extension, InsForge, OpenAI (use Gemini), heavy analytics, website scrapers as primary ingest.

Build state: tracked in `context/progress-tracker.md`. `context/` docs are binding technical authority; `project-brief.md` wins on product requirements.

## Brand Commitments

- Name: **DocuChat**
- Voice: clear, confident, practical — help-center energy, not hype
- Visual system: `DESIGN.md` + `context/ui-tokens.md` (forest accent; Literata display + Public Sans UI). Do not lean into generic purple-AI aesthetics.

## Evidence on Hand

**None** yet (no real customers). Landing must not invent metrics, logos, or testimonials. Truthful claims about what the software does are required.

## Pricing (gated features)

| Plan | Price (demo) | Gates |
| --- | --- | --- |
| Free | $0 | 1 bot, 100 messages/mo, 10 MB storage, widget shows DocuChat badge |
| Pro | $29/mo (test) | 5 bots, 2,000 messages/mo, 200 MB, remove branding |
| Business | $99/mo (test) | 20 bots, 10,000 messages/mo, 1 GB, remove branding, higher rate limits |

## Product Principles

1. **Grounded answers beat clever ones.** Prefer “I don’t know from your docs” over hallucination.
2. **Same brain, two surfaces.** In-app chat and widget share retrieval + model path.
3. **Gates are real.** Enforce limits on the server; UI only explains them.
4. **Focused scope.** Every feature must serve upload → answer → embed → upgrade.
5. **Launchable honesty.** Stripe is test mode; say so in billing copy if needed — still ship a real Checkout flow.
