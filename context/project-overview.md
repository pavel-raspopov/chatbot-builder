# Project Overview

## About the Project

**DocuChat** is an embeddable chatbot builder for SaaS and product teams. Users upload company docs and knowledge, DocuChat turns that knowledge into a grounded chatbot, and the same bot is available inside the app (ChatGPT-like chat) and as an embeddable widget on customer websites.

This repo implements the Embeddable Chatbot Builder MVP described in `context/project-brief.md` (source of truth). Treat DocuChat as a real product ready to launch — Stripe runs in **test mode** (no live payments).

---

## The Problem It Solves

Support and docs teams bury answers in PDFs, Notion exports, and help-center dumps. Site visitors still email “how do I…?” questions. DocuChat lets a small team upload those docs once, try the bot in-app, and paste a snippet so the same answers appear on their marketing or docs site.

---

## Niche

**SaaS / product docs support bot** — PDF and Markdown/text knowledge bases for product FAQs, onboarding, and help articles. One owner per account (no multi-seat orgs in MVP).

---

## Pages

```
/                         → Landing (features + pricing + CTA)
/login                    → Auth
/signup                   → Auth (if separate from login)
/dashboard                → Overview: bots, usage, upgrade prompts
/bots                     → List bots
/bots/new                 → Create bot
/bots/[id]                → Bot settings, docs, embed snippet
/bots/[id]/chat           → In-app ChatGPT-like chat
/settings/billing         → Plan, Stripe Checkout / portal, usage
```

Public (no app session):

```
/w/[publicId]             → Optional hosted widget preview page
/api/widget/*             → Public widget chat API (CORS-enabled)
```

---

## Navigation

Top navbar for authenticated app:

```
Dashboard    Bots    Billing
```

Landing has its own marketing nav (Features, Pricing, Login / Start free). Full-width layouts. No sidebar in MVP.

---

## Core User Flow

### Landing

- Hero, product story, features, pricing table, CTA to signup
- Logged-in users hitting primary CTA → `/dashboard`

### Auth

- Sign up / sign in via Supabase Auth
- After auth → `/dashboard`

### Create a bot

- Name, optional system prompt / welcome message
- Plan gates how many bots the user may create

### Upload knowledge

- Upload PDF and/or `.md` / `.txt` files to Supabase Storage
- Server ingests: extract → chunk → embed → store in `chunks` (pgvector)
- Show ingest status per document (pending / ready / failed)

### In-app chat

- ChatGPT-like UI on `/bots/[id]/chat`
- Answers grounded in that bot’s chunks; refuse or say “I don’t know” when retrieval is empty
- Counts toward monthly message quota

### Embed widget

- Bot detail page shows a copy-paste script snippet (public bot id)
- Customer pastes snippet on their site; floating chat asks the same RAG pipeline
- Free plan may show “Powered by DocuChat”; paid plans can remove branding

### Billing

- Free / Pro / Business plans (see PRODUCT.md)
- Stripe Checkout (test mode) + webhook (or session verify) updates plan
- Server-side gates: bot count, messages/month, storage, branding

---

## Pricing Gates (summary)

| | Free | Pro | Business |
| --- | --- | --- | --- |
| Bots | 1 | 5 | 20 |
| Messages / month | 100 | 2,000 | 10,000 |
| Doc storage | 10 MB | 200 MB | 1 GB |
| Widget branding | DocuChat badge | Removable | Removable |
| Priority (soft) | — | — | Higher rate limits |

Exact Stripe price IDs live in env / `library-docs.md` once created.

---

## Out of Scope (do not build)

- Multi-seat / team orgs, SSO, roles
- Fine-tuning, custom models, multi-provider switching UI
- Live (non-test) Stripe payments
- Mobile apps, browser extension
- Scraping entire websites as primary ingest (optional URL fetch is not required for MVP)
- InsForge or any non-Supabase BaaS
- OpenAI for chatbot/embeddings (locked to Gemini)
- Heavy analytics dashboards (basic usage counters only)

---

## Deliverables (from brief)

1. Landing page with features + pricing
2. Web app: upload → chat → embed + billing gates
3. Presentation: prefer video demo with screenshare + voiceover

---

## Success Criteria

- Focused scope — no useless features
- Landing makes someone want to try the product
- Features work end-to-end (ingest, in-app chat, widget, billing in test mode)
- Attention to detail: copy, design, feel, functionality
