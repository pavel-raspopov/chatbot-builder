# Video 2 — technical sandbox (B2, 6–8 minutes)

Optional extra for a technical reviewer. Screen + voice. Webcam optional (OBS camera source). Not a code-reading session.

**Pronunciation:** Supabase = SOO-puh-base. Gemini = JEM-in-eye. Postgres = POST-gress.

Never zoom into keys. Crop or cover any `whsec_`, `sk_`, or service-role value in the terminal.

---

### Scene A — Intro (app still open, ~20s)

This second video is technical.

DocuChat is a Next.js app. The backend is **Supabase**. The model is **Google Gemini**. Billing is **Stripe test mode**.

We did not use a mock billing screen. We did not use OpenAI.

### Scene B — Local sandbox (terminal + browser)

On my machine I run `npm run dev`. The app is on localhost port 3000.

For billing in development I also run Stripe CLI: `stripe listen`. It forwards webhooks to our Next.js route.

`[Show the two terminals. Hide secrets. Browser can stay on Billing if you are already on Pro from Video 1.]`

The webhook is what writes the new plan into the user profile. The browser cannot change the plan by itself.

### Scene C — Supabase (dashboard — not the API keys page)

`[Table Editor: profiles, bots, documents, chunks, conversations, messages]`

Supabase does four jobs: login, database, file storage, and vector search.

Each user only sees their own rows. That is Row Level Security.

Uploaded files go to a private **documents** bucket.

Chat search uses **pgvector**. We store embeddings with 768 numbers, because that matches the Gemini embedding model.

Public website visitors are not logged in. The widget uses a public bot id, not a Supabase user session.

`[You may say: confirm email is off for a smooth local demo. Do not open secrets.]`

### Scene D — Gemini (talk over in-app chat — do not open Google Cloud keys)

When I upload a file, the server extracts text, splits it, and asks Gemini for embeddings.

When I ask a question, we turn the question into an embedding, find the closest parts of the docs, and then Gemini writes the answer from those parts.

If nothing is close enough, we skip the model and return “I don’t know from your docs.”

The in-app chat and the widget share that same path.

### Scene E — Stripe (Dashboard, Test mode ON)

`[Products: Pro $29, Business $99]`

Plans are Free, Pro, and Business. Limits live in code: bots, monthly messages, storage, and the branding badge.

Checkout and Customer Portal are Stripe-hosted. Our server checks the webhook, then updates the user’s plan.

The test card is the standard Stripe number. No real money moves.

### Scene F — How we built it (~60–90s)

`[Repo: context/project-brief.md, then lib/plans.ts. Never .env.local.]`

The brief is the source of truth. We kept a written architecture and a progress tracker. We built in small phases: landing, auth, bots, ingest, chat, widget, then billing.

Design uses a small token system, not random colours. Scope stayed tight on purpose: no team seats, no live payments, no second AI provider.

### Close

So the sandboxes are: local Next.js, a real Supabase project, Gemini for embeddings and chat, and Stripe in test mode with a local webhook forwarder.

The product you saw in the first video is this stack, end to end.

Thank you.
