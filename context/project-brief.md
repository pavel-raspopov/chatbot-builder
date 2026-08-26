# DocuChat — Product Brief

## Goal

Build a real product MVP: an app where users upload their company documents and knowledge and turn them into a chatbot. The bot works inside the app as a ChatGPT-like chat, and the same bot can be embedded on any website as a widget, so visitors can ask questions there too.

Treat the result as a product ready to launch and serve real users — even though billing runs in Stripe test mode with no live payments.

## Scope

Focused scope only — every feature has to earn its place:

- Landing page showcasing the product features and pricing
- Upload company docs (PDF, Markdown, or plain text) and turn them into a searchable knowledge base
- In-app chat grounded in those documents; when the answer is not in the docs, say so instead of inventing one
- Embeddable widget so customers can put the same bot on their website
- Pricing with gated plans and a working Stripe test billing flow

## Stack

- Supabase — data storage, user auth, vector search
- Google Gemini — embeddings and chat answers
- Stripe test mode — pricing and billing

## What good looks like

- No useless features; focused scope
- A descriptive landing page that shows the product just enough so users want to test it
- A functioning app with working features
- Attention to detail: copywriting, design, feel, functionality
