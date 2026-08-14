# Video 1 — product demo (B2, 4.5–6 minutes)

Required deliverable. Screen + voice. No webcam.

**Pronunciation:** DocuChat = DOK-yoo-chat. Stripe = stripe. widget = WID-jit.

Speak slowly. Short sentences. Click during a pause, not while you talk.

Exact buttons in the app: **Start free**, **Create account**, **Create bot**, **Open chat**, **Preview**, **Upgrade to Pro**. Document status: **Ready**.

---

### 0:00 — Open (landing hero — do not click yet)

Hello. This is **DocuChat**. It is a small product for support teams.

You upload company documents. DocuChat turns them into a chatbot.

You can chat inside the app. You can also put the same bot on your website.

### 0:20 — Features + pricing

`[SCROLL to Features]`

The idea is simple. Upload the files you already have. Test answers in the app. Then paste one script on your site.

When the bot does not find an answer in your docs, it says it does not know. It does not invent steps.

`[SCROLL to Pricing]`

There are three plans. Free, Pro, and Business.

Free is enough to try: one bot, one hundred messages per month, and a small DocuChat badge on the widget.

Pro is twenty-nine dollars per month in Stripe test mode. More bots, more messages, and you can hide the badge.

This is a real checkout flow, but it uses Stripe **test** mode. There are no live payments.

### 0:55 — Sign up

`[CLICK Start free]`

I will create a free account. No card is required.

`[Type a demo email and password. CLICK Create account. Wait for Dashboard.]`

This is the dashboard. I am on the Free plan. I have no bots yet.

### 1:20 — Create bot

`[CLICK Create bot]`

I will create a support bot for a fake product called Northwind Desk.

Name: Support assistant.

Welcome message: Hi. Ask me about refunds, hours, or how to invite a teammate.

`[CLICK Create bot. Wait for the bot page.]`

### 1:45 — Upload

`[SCROLL to the upload area. Drop docs/demo/northwind-desk-faq.md]`

I upload a short FAQ. DocuChat stores the file, splits it into parts, and prepares it for search.

`[WAIT until the list shows Ready. Do not talk over a long wait. Then say:]`

Indexing is done. The document is ready.

### 2:15 — In-app chat

`[CLICK Open chat]`

First, a question that is in the file.

`[Type: How long is the refund window? Send. Wait for the answer.]`

The answer is fourteen days. That number comes from the document, not from general knowledge.

Now a question that is **not** in the file.

`[Type: What is the CEO’s salary? Send.]`

It says it does not know from the docs. That is the behaviour we want for a support bot.

### 3:10 — Embed widget

`[Go back to the bot page — browser Back, or Bots → this bot. SCROLL to Embed on your site]`

This is the snippet a customer would paste on their website.

`[CLICK Preview — new tab. Open the widget. Point at Powered by DocuChat]`

This preview is the same widget visitors would see. On Free, the panel shows **Powered by DocuChat**.

`[If time is tight: stop here. If you have 20 seconds: ask the refund question in the widget too.]`

In-app chat and the widget share the same answer path. One brain, two surfaces.

### 3:50 — Billing / Stripe test

`[CLICK Billing in the app nav]`

Here is usage: bots, messages, and storage. I am still on Free.

I will upgrade to Pro with Stripe test checkout.

`[CLICK Upgrade to Pro. Stripe page loads]`

This is Stripe’s hosted checkout, in test mode.

`[Card ACCT-000015, any future expiry, any CVC, any name. Pay. Wait for redirect to Billing.]`

`[If the plan is still Free: stop. stripe listen was not running. Fix it, then re-record this beat.]`

Back in DocuChat, the plan is Pro. Limits are higher, and I can hide the widget badge in bot settings.

### 5:00 — Close

That is the full path. Landing, sign up, upload, in-app chat, embed, and a real test payment.

DocuChat is a focused MVP: only the features a small team needs to go from documents to answers on their site.

Thank you.

---

## Time cuts

- **Over 6 minutes:** do not repeat the question in the widget. Show preview + badge only.
- **30 seconds left after Pro:** bot settings → tick **Remove DocuChat badge on the widget** → **Save settings** → refresh Preview → badge gone.
