---
description: Instructions for building DocuChat with Cursor agents
globs: *
alwaysApply: true
---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Context Efficiency & Sub-Agent Execution

1. Targeted Context Loading:
   - Do not read documentation files (context/*) "just in case".
   - Read UI or architecture rule files ONLY if the current subtask explicitly requires it.

2. Concise Reporting:
   - When returning results to the main agent, provide a brief summary (3–5 bullet points): what was done, which files were modified, and the verification status.
   - Do not recap your entire thought process or step-by-step reasoning.

3. Ban on Exhaustive Searches:
   - If you cannot find a required file within 2–3 search attempts, stop and ask the main agent or user instead of scanning the entire repository.

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-brief.md
2. context/project-overview.md
3. context/architecture.md
4. context/ui-tokens.md
5. context/ui-rules.md
6. context/ui-registry.md
7. context/code-standards.md
8. context/library-docs.md
9. context/build-plan.md
10. context/progress-tracker.md

`context/project-brief.md` is the single source of truth for product requirements. Do not contradict it.

## Rules That Never Change

- Never use hardcoded hex values or raw Tailwind color classes — use tokens from `context/ui-tokens.md`
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — load its installed skill first,
  then read `context/library-docs.md` for project-specific rules
- If the same problem persists after one corrective prompt —
  stop immediately and run /recover
- **Never use InsForge** for this project. Do not call `user-insforge` MCP tools. Backend is Supabase only.

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/feature-review` — the project's custom 3-layer review. Run before demo or when something feels off. Always prefer this over Bugbot / Security Review subagents when the user asks for a "review".
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.
- `/using-superpowers` – before executing any task. Check and load relevant skills.
- `/brainstorming` – before any new feature or UI. Explore requirements & design.
- `/writing-plans` – before implementing complex features. Create step-by-step specs.
- `/executing-plans` – when executing a step-by-step implementation plan.
- `/test-driven-development` – when writing new code or fixes. Write failing tests first.
- `/systematic-debugging` – when facing bugs or test failures. Find root cause first.
- `/verification-before-completion` – before marking task complete. Test, build, and validate.
- `/task-observer` – invoke at the start of every task-oriented session. Watches the session for skill improvement opportunities and logs observations.
- `/impeccable <command>` – design guidance for frontend work (`init`, `audit`, `critique`, `polish`, `shape`, `animate`, and more). Run `/impeccable init` once to set up design context; type `/impeccable` alone to see all 23 commands.

# Supabase + Stack Overview

## What is DocuChat?

DocuChat is an embeddable chatbot builder: users upload company docs/knowledge, get a ChatGPT-like in-app chat, and embed a widget on their websites. See `context/project-brief.md`.

## Stack (locked)

| Layer | Tool | Purpose |
| --- | --- | --- |
| Framework | Next.js (App Router) | Full-stack web app |
| Auth + DB + Storage + Vectors | Supabase | Auth, Postgres, Storage, pgvector |
| AI | Gemini API | Embeddings + chat completions |
| Billing | Stripe (test mode) | Checkout, webhooks, plan gating |
| Styling | Tailwind CSS + tokens | UI |
| Language | TypeScript strict | Throughout |

## Supabase — Critical Rules

### Client vs Server

Two separate clients — never mix them:

```typescript
// lib/supabase/client.ts — browser / Client Components only
import { createBrowserClient } from "@supabase/ssr";

// lib/supabase/server.ts — Server Components, Route Handlers, Server Actions
import { createServerClient } from "@supabase/ssr";
```

- Use the **anon key** + user session for normal CRUD under RLS.
- Use the **service role key** only on the server for privileged ingest/embeddings/admin paths that cannot run under the user JWT. Never expose the service role to the browser.
- Every user-owned table must have RLS policies filtering by `auth.uid()`.
- Enable the `vector` extension for embeddings; store chunk embeddings in a `vector` column and query with similarity search (RPC or SQL).

### Auth

- Supabase Auth (email/password and/or OAuth as decided in build plan).
- Protect app routes with middleware that refreshes the session via `@supabase/ssr`.
- Public widget chat endpoints authenticate by bot public id / embed key — not by the site visitor’s Supabase session.

### Before Writing Supabase / Stripe / Gemini Code

1. Read `context/library-docs.md` for this project’s patterns.
2. Prefer official docs over training data (APIs change).
3. Do **not** use InsForge MCP or `@insforge/sdk`.

## Stripe (test mode)

- Use Stripe test keys and Checkout (or Customer Portal) for upgrades.
- Fulfill plan changes via webhook (or verified session) into a `subscriptions` / `profiles.plan` record.
- Gate features (bots count, monthly messages, storage, widget branding) server-side — never trust the client alone.

## AI Chat / RAG

- Provider: **Google Gemini** only (`GEMINI_API_KEY`). Do not use OpenAI for chatbot or embeddings.
- Ingest: upload → Storage → extract text → chunk → embed → store in `chunks`.
- Chat: embed query → retrieve top-k chunks for that bot → Gemini answer with citations when useful.
- In-app chat and embeddable widget share the same retrieval + completion pipeline; differ only in auth/CORS/UI.

## Important Notes

- Treat the demo as a launchable MVP: focused scope, real billing flow in test mode, polish and copy matter.
- Prefer mock-safe Stripe test credentials over fake “mock billing” UI that skips Checkout — unless the environment blocks Stripe entirely.
- Use Tailwind design tokens from `context/ui-tokens.md`. Prefer Tailwind v4 `@theme` unless the scaffold locks an older version — document the choice in `library-docs.md` when the app is scaffolded.
