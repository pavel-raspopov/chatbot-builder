# 14 Presentation — recording pack

**Open point — Video 2 (record only if HR asks).** Product demo (Video 1) is already submitted. Script, scenes, and privacy notes: [video-2-technical-script.md](video-2-technical-script.md). Tooling: OBS, ~6–8 min, no keys on camera. Export `docuchat-technical.mp4`. Dry-run: `npm run dev` + `stripe listen` still running; stay on Pro from Video 1 if you already upgraded.

Two videos for the job-task deliverable. **Video 1 is required** by [context/project-brief.md](../../context/project-brief.md). Video 2 is extra technical context.

| File | What it is |
| --- | --- |
| [video-1-product-script.md](video-1-product-script.md) | Product demo (~5 min), B2 English |
| [video-2-technical-script.md](video-2-technical-script.md) | Sandboxes + stack (~7 min), B2 English |
| [northwind-desk-faq.md](northwind-desk-faq.md) | File to upload on camera |

You record on this machine. The agent cannot capture your screen.

---

## What the brief grades (Video 1 must show all of this)

- Landing with features and pricing
- Sign up
- Upload a document
- In-app chat (answer from the file + “I don’t know from your docs”)
- Embed widget preview
- Stripe **test** upgrade

Do not mix Video 1 with dashboards, `.env`, or API keys.

---

## Recording tools

There is no Windows “screen saver” that records video.

| Tool | Shortcut | Screen | Microphone | Front camera |
| --- | --- | --- | --- | --- |
| Snipping Tool | `Win+Shift+R` | Yes | Optional | **No** |
| Xbox Game Bar | `Win+G`, then `Win+Alt+R` | Yes | Optional | **No** |
| Clipchamp (Windows 11) | Open Clipchamp → Record | Yes | Yes | Yes, if you choose screen + camera |
| OBS Studio (free) | Scenes | Yes | Yes | Yes, if you add a camera source |

**B2 recommendation**

1. **Video 1:** record the **screen silent** (Snipping Tool or Game Bar). Add the voice later in Clipchamp while you read the script. If one sentence is wrong, re-record **audio only**.
2. **Video 2:** use **OBS** so you can switch scenes (app → terminals → Supabase → Stripe). Skip the webcam unless you want a 10-second talking-head intro.

Do **not** show `.env.local`, API keys, webhook secrets (`whsec_…`), or the Supabase service role key.

---

## Before you record (same day, no camera)

If any step fails, fix it before Video 1. Do not improvise on camera.

1. Log **out** of DocuChat (landing must show **Start free**, not **Go to dashboard**).
2. Terminal 1: `npm run dev` — open [http://localhost:3000](http://localhost:3000).
3. Terminal 2: `stripe listen --forward-to localhost:3000/api/stripe/webhook`  
   Without this, Checkout can succeed and the plan **stays Free**.
4. Supabase Auth → Providers → Email: **Confirm email** off (local demo).
5. Browser: 125% zoom, hide bookmarks, close extra tabs, turn off notifications.
6. Walk the path once:

   - Sign up (new email, password 8+ characters) → dashboard **Free**, **No bots yet**
   - **Create bot** → name `Support assistant` → welcome from the Video 1 script → **Create bot**
   - Upload [northwind-desk-faq.md](northwind-desk-faq.md) → wait until status is **Ready**
   - **Open chat** → “How long is the refund window?” → **14 days**
   - “What is the CEO’s salary?” → **I don’t know from your docs**
   - Bot page → **Preview** → welcome bubble + **Powered by DocuChat**
   - **Billing** → **Upgrade to Pro** → Stripe test card `ACCT-000015`, any future date, any CVC → Billing shows **Pro**

7. For the real take: use a **fresh** signup (or delete the demo bot and stay on Free). Video 1 should start with zero bots on Free.

---

## After recording

- Export **1080p**, H.264, `.mp4`
- Names: `docuchat-product-demo.mp4` and `docuchat-technical.mp4`
- Watch Video 1 against the brief list above. If landing, chat, widget, or Stripe is missing, re-record that beat only.
- Submit Video 1 as the main file. Attach Video 2 if the application allows a second file or a Drive folder.

## B2 speaking

- About 110 words per minute. Pause after two sentences; click during the pause.
- Do not say “sorry for my English.”
- Prefer: “from your docs”, “the same bot”, “search in the documents.”
- Avoid: leverage, robust, seamless, pipeline, grounded, RAG.
