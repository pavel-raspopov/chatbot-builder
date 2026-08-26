# DocuChat

Embeddable chatbot builder for SaaS and product teams. Upload PDFs or Markdown, try a ChatGPT-like chat inside the app, then paste one script so the same answers appear on your website.

This repo is a complete, launchable **MVP**: focused scope, real ingest + retrieval, a public widget, and Stripe **test-mode** billing. There are no live payments.

## What it does

- **Landing** — product story, features, Free / Pro / Business pricing
- **Auth** — email and password (Supabase Auth)
- **Bots** — create a bot, set welcome message and system prompt
- **Knowledge** — upload `.pdf`, `.md`, or `.txt`; files are chunked and embedded
- **In-app chat** — answers from that bot’s docs; says it does not know when retrieval is empty
- **Embed widget** — copy-paste snippet + hosted preview; Free plan shows a DocuChat badge
- **Billing** — Stripe Checkout and Customer Portal in test mode; server-side gates for bots, messages, storage, and branding

In-app chat and the widget share the same retrieval and answer path.

## Stack

| Layer | Tool |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| Auth, DB, Storage, vectors | Supabase (Postgres, RLS, pgvector, Storage) |
| AI | Google Gemini (embeddings + chat) |
| Billing | Stripe test mode (Checkout + webhooks) |
| UI | Tailwind CSS v4, design tokens |

Not used: OpenAI, live Stripe charges, team seats.

## Plans

| | Free | Pro | Business |
| --- | --- | --- | --- |
| Price (demo) | $0 | $29 / mo (test) | $99 / mo (test) |
| Bots | 1 | 5 | 20 |
| Messages / month | 100 | 2,000 | 10,000 |
| Doc storage | 10 MB | 200 MB | 1 GB |
| Widget badge | Shown | Can hide | Can hide |

Limits are enforced on the server (`lib/plans.ts`). The client cannot write `profiles.plan`.

## Local setup

1. Clone the repo and install:

   ```bash
   npm install
   ```

2. Copy [`.env.example`](.env.example) to `.env.local` and fill in:

   - Supabase URL, publishable (or anon) key, and **server-only** service role key
   - `GEMINI_API_KEY`
   - Stripe **test** secret key, webhook secret, and price IDs for Pro and Business
   - `NEXT_PUBLIC_APP_URL` (usually `http://localhost:3000`)

   Never commit `.env.local`.

3. Apply SQL in [`supabase/migrations/`](supabase/migrations/) to your Supabase project. Enable the `vector` extension. Create a private Storage bucket named `documents`.

4. In Supabase Auth → Providers → Email, turn **Confirm email** off for a smooth local demo (signup returns a session immediately).

5. Run the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

6. For billing to update after Checkout, forward webhooks in a second terminal:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Use Stripe test card `ACCT-000015`. Without `stripe listen`, Checkout can succeed and the plan stays Free.

```bash
npm run lint
npm run build
```

## Testing

The suite runs on [Vitest](https://vitest.dev) with Testing Library (happy-dom) for components:

```
npm run test            # single pass
npm run test:watch      # watch mode
npm run test:coverage   # coverage report + thresholds
```

- **lib/** — pure utilities, RAG pipeline, usage quotas, billing/stripe helpers (fake Supabase client in `tests/helpers/fake-supabase.ts`)
- **app/api/** — route handlers incl. SSE streaming and real Stripe signature verification
- **actions/** — server actions with mocked `next/navigation` redirects
- **components/** — interactive UI (forms, uploader, composer)

Coverage thresholds: global lines ≥ 65%, `lib/` lines ≥ 80%.

## Project layout

```
app/            Routes (landing, auth, dashboard, bots, chat, billing, public widget)
actions/        Server Actions (auth, bots, documents, billing)
lib/            Supabase clients, Gemini, RAG, plans, usage
public/widget.js  Embed launcher for customer sites
supabase/migrations/  Schema, RLS, RPCs
context/        Product brief, architecture, build plan (source of truth while building)
```

## License

Released under the [MIT License](LICENSE) — shared as a portfolio piece, feel free to learn from it.
