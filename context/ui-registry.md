# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

Imprinted from the shipped landing (01) on **2026-08-11** via `/imprint` + `/impeccable document`.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then add it here

After building any component — update this file with the component name, file path, and exact classes used. Run `/imprint`.

Capability claims here are history — re-check `app/globals.css`, `ui-tokens.md`, and `DESIGN.md` before treating a “missing token” note as absolute.

---

## Baseline — Established 2026-08-11

Note: Baseline established from the first real UI (`/impeccable document` scan + `/imprint`).

| Property | Correct class |
| --- | --- |
| Page background | `bg-background` |
| Card / panel background | `bg-surface` |
| Card border | `border border-border` |
| Card radius | `rounded-lg` |
| Card padding | `p-6` |
| Card shadow | `shadow-card` |
| Highlighted card | `border-accent ring-1 ring-accent` |
| Button primary | `rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark` |
| Button secondary | `rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary` |
| Text primary | `text-text-primary` |
| Text secondary | `text-text-secondary` |
| Text muted | `text-text-muted` |
| Focus ring (fields) | `focus:outline-none focus:ring-1 focus:ring-accent` |
| Focus ring (links / buttons) | `focus:outline-none focus-visible:ring-1 focus-visible:ring-accent` |
| Marketing max width | `max-w-[1120px] px-6` |
| Marketing header height | `h-16` |
| App max width | `max-w-[1440px] px-6 sm:px-8` |
| Landing section rhythm | `py-20 sm:py-24` |
| Control radius | `rounded-md` |
| Display type | `font-display` |
| UI / body type | `font-sans` (default on `body`) |

---

## Components

### Button

File: `components/ui/Button.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Layout | `inline-flex items-center justify-center` |
| Border radius | `rounded-md` |
| Text | `text-sm font-medium` |
| Spacing | `px-4 py-2` |
| Primary background | `bg-accent` |
| Primary text | `text-accent-foreground` |
| Primary hover | `hover:bg-accent-dark` |
| Secondary background | `bg-surface` |
| Secondary border | `border border-border` |
| Secondary text | `text-text-primary` |
| Secondary hover | `hover:bg-surface-secondary` |
| Focus | `focus:outline-none focus-visible:ring-1 focus-visible:ring-accent` |
| Transition | `transition-colors` |

**Pattern notes:**  
`href` → Next.js `Link`; otherwise `<button type="button">`. Do not invent a third variant or radius without updating tokens + this registry.

---

### LandingNav

File: `components/landing/LandingNav.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Background | `bg-surface/95 backdrop-blur-sm` |
| Border | `border-b border-border` |
| Height / layout | `h-16`, inner `max-w-[1120px] px-6` |
| Brand text | `font-display text-xl font-semibold tracking-tight text-text-primary` |
| Nav link text | `text-sm font-medium text-text-secondary` |
| Nav link hover | `hover:text-accent` |
| Focus | `focus:outline-none focus:ring-1 focus:ring-accent` |

**Pattern notes:**  
Sticky marketing chrome. Primary CTA uses shared `Button`. App navbar (`AppNavbar`) keeps the same color language; items are Dashboard / Bots / Billing.

---

### Hero

File: `components/landing/Hero.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Page atmosphere | `bg-background` + token radial `accent-light` + subtle rule texture |
| Brand | `font-display text-3xl font-semibold tracking-tight text-accent sm:text-4xl` |
| Headline | `font-display text-[clamp(2.5rem,5vw,3.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-primary` |
| Support | `text-lg leading-relaxed text-text-secondary` |
| Motion | `animate-fade-up`, `animate-fade-up-delay` |

**Pattern notes:**  
One-composition hero only. Dominant visual is `HeroChatMock`, not a card collage. No eyebrows, stats, or testimonials.

---

### HeroChatMock

File: `components/landing/HeroChatMock.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Background | `bg-surface` |
| Border | `border border-border` |
| Border radius | `rounded-lg` |
| Shadow | `shadow-card` |
| Chrome bar | `bg-surface-secondary border-b border-border` |
| Caption | `text-xs font-medium text-text-muted` |
| User bubble | `rounded-md bg-accent-muted … text-text-primary` |
| Assistant bubble | `rounded-md border border-border bg-surface-secondary … text-text-primary` |
| Motion | `animate-hero-mock` |

**Pattern notes:**  
Decorative (`aria-hidden`). Chat bubble contrast uses surface tones — never rainbow accents. Live in-app chat (`ChatMessage` / `ChatThread`) matches these bubble tokens.

---

### Features

File: `components/landing/Features.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Section rhythm | `py-20 sm:py-24` |
| Section title | `font-display text-3xl font-semibold tracking-tight sm:text-4xl text-text-primary` |
| Body | `text-base leading-relaxed text-text-secondary` |
| Feature title | `text-xl font-semibold sm:text-2xl text-text-primary` |

**Pattern notes:**  
Stacked one-job articles — not a three-up icon-card grid. No decorative accent left borders.

---

### Pricing

File: `components/landing/Pricing.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Section band | `border-t border-border bg-surface-secondary/40` |
| Card | `rounded-lg border bg-surface p-6 shadow-card` |
| Default border | `border-border` |
| Highlighted | `border-accent ring-1 ring-accent` |
| Price | `font-display text-4xl font-semibold tracking-tight` |
| Meta | `text-sm text-text-muted` |
| Accent marker | `bg-accent` (feature bullets) |

**Pattern notes:**  
Data from `lib/plans.ts`. Cards are allowed because they hold CTAs. Pro is the highlighted plan.

---

### FinalCta

File: `components/landing/FinalCta.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Background | `bg-accent-muted` |
| Border | `border-t border-border` |
| Title | `font-display text-3xl font-semibold tracking-tight text-text-primary` |
| Body | `text-base leading-relaxed text-text-secondary` |

**Pattern notes:**  
Closing band with primary `Button` → `/signup`. Keep copy honest; no fake urgency metrics.

---

### LandingFooter

File: `components/landing/LandingFooter.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Background | `bg-surface` |
| Border | `border-t border-border` |
| Brand | `font-display text-lg font-semibold text-text-primary` |
| Links | `text-sm font-medium text-text-secondary hover:text-accent` |

---

### Auth pages

File: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`  
Forms: `components/auth/LoginForm.tsx`, `components/auth/SignupForm.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Background | page `bg-background` (root); no card chrome |
| Border | none on page shell |
| Border radius | none on page; controls use `rounded-md` |
| Text — brand | `font-display text-2xl font-semibold text-accent` |
| Text — title | `font-display text-3xl font-semibold tracking-tight text-text-primary` |
| Text — body | `text-base leading-relaxed text-text-secondary` |
| Spacing | `px-6 py-16`; brand→title `mt-4`; title→body `mt-3`; form `mt-8 flex flex-col gap-4` |
| Errors | `text-sm text-error` + `role="alert"` |
| Info callout | `rounded-md border border-border bg-accent-muted px-3 py-2 text-sm text-text-secondary` |
| Footer link | `font-medium text-accent hover:text-accent-dark focus:ring-1 focus:ring-accent` |
| Hover / focus | accent link hover; shared Button focus ring |
| Shadow | none |
| Accent usage | brand wordmark + text links + primary submit |

**Pattern notes:**  
Operate gate screens — centered `max-w-md`, no marketing cards. Server Actions in `actions/auth.ts` + `useActionState`. No OAuth in MVP. Submit Button may be `w-full`.

### Input

File: `components/ui/Input.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Background | `bg-surface` |
| Border | `border border-border` |
| Border radius | `rounded-md` |
| Text — label | `text-sm font-medium text-text-primary` |
| Text — value | `text-base font-normal text-text-primary` |
| Text — placeholder | `placeholder:text-text-muted` |
| Text — error | `text-sm font-normal text-error` |
| Spacing | label column `gap-1.5`; field `px-3 py-2` |
| Hover state | none (focus only) |
| Focus | `focus:outline-none focus:ring-1 focus:ring-accent` |
| Shadow | none |
| Accent usage | focus ring only |

**Pattern notes:**  
Label wraps the control. Prefer shared `Input` over ad-hoc `<input>`. Disabled: `disabled:opacity-60`.

### Dashboard overview

File: `components/dashboard/DashboardOverview.tsx` (loaded by `app/(app)/dashboard/page.tsx`)  
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Background | inherits shell `bg-background`; no decorative cards |
| Layout | content `max-w-2xl` inside app main |
| Title | `font-display text-3xl font-semibold tracking-tight text-text-primary` |
| Plan badge | `rounded-md bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent` |
| Body | `text-base leading-relaxed text-text-secondary` |
| Meter track | `h-1.5 rounded-sm bg-surface-secondary` |
| Meter fill | `bg-accent` (at limit: `bg-warning` + `text-warning` on count) |
| Empty title | `font-display text-xl font-semibold tracking-tight text-text-primary` |
| Actions | at bot limit: primary Upgrade → `/settings/billing`; otherwise primary Create bot → `/bots/new` and optional secondary Upgrade |
| Errors | `text-error` + `role="alert"` on page loader |
| Shadow | none |

**Pattern notes:**  
Server page fetches `profiles` + `bots` count under RLS; presentational overview only. Meters use shared `UsageMeter`. At bot limit the primary CTA is Upgrade.

### AppNavbar

File: `components/layout/AppNavbar.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | `bg-surface/95 backdrop-blur-sm` |
| Border | `border-b border-border` |
| Height / layout | `h-16`, inner `max-w-[1440px] px-6 sm:px-8` |
| Brand text | `font-display text-xl font-semibold tracking-tight text-text-primary` |
| Nav link inactive | `text-sm font-medium text-text-secondary hover:text-accent` |
| Nav link active | `text-sm font-medium text-accent` |
| Focus | `focus:outline-none focus-visible:ring-1 focus-visible:ring-accent` |
| Sign out | secondary `Button` in Server Action form |
| Narrow screens | Brand + Sign out on the first row; Dashboard / Bots / Billing wrap below. `px-4` until `sm`. |

**Pattern notes:**  
Client component for `usePathname`. Active: color only (no underline). Brand links to `/dashboard`. Billing matches `/settings/*`. Do not keep all nav items in one unwrapping row — that overflows below ~400px.

### AppFooter

File: `components/layout/AppFooter.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Background | `bg-surface` |
| Border | `border-t border-border` |
| Layout | `max-w-[1440px] px-6 py-8 sm:px-8` |
| Brand | `font-display text-lg font-semibold text-text-primary` |
| Tagline | `text-sm text-text-muted` |

**Pattern notes:**  
App chrome only — no marketing anchors. Tagline: “Product docs chatbot”.

### App shell layout

File: `app/(app)/layout.tsx`  
Last updated: 2026-08-11

| Property | Class |
| --- | --- |
| Page shell | `flex min-h-dvh flex-col bg-background` |
| Main | `mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 sm:px-8` |

**Pattern notes:**  
Wraps AppNavbar → main → AppFooter. Top nav only — no sidebar.

### Textarea

File: `components/ui/Textarea.tsx`  
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Label | wraps control; `flex flex-col gap-1.5 text-sm font-medium text-text-primary` |
| Field | `rounded-md border border-border bg-surface px-3 py-2 text-base font-normal text-text-primary` |
| Placeholder | `placeholder:text-text-muted` |
| Focus | `focus:outline-none focus:ring-1 focus:ring-accent` |
| Disabled | `disabled:opacity-60` |
| Error | `text-sm font-normal text-error` |
| Default rows | `4` (override per form) |

**Pattern notes:**  
Same chrome as `Input`. Prefer shared `Textarea` for multi-line fields (welcome message, system prompt).

### Bots list

File: `components/bots/BotsList.tsx` (loaded by `app/(app)/bots/page.tsx`)  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Layout | `max-w-2xl` |
| Title | `font-display text-3xl font-semibold tracking-tight text-text-primary` |
| Meta | `text-base leading-relaxed text-text-secondary` (`n / max` bots) |
| List | `divide-y divide-border border-y border-border`; rows `py-4` |
| Bot name link | `font-medium text-text-primary hover:text-accent focus-visible:ring-1 focus-visible:ring-accent` |
| Empty title | `font-display text-xl font-semibold tracking-tight text-text-primary` |
| Actions | Chat → `/bots/[id]/chat` (secondary); Create → `/bots/new`; at limit Upgrade → `/settings/billing`; Delete secondary `Button` |
| Errors | `text-sm text-error` + `role="alert"` |

**Pattern notes:**  
No cards. Typography list + thin dividers. Client for delete via Server Action + `router.refresh()`. Plan limit gated in UI and `actions/bots.ts`.

### Create bot form

File: `components/bots/CreateBotForm.tsx` (page `app/(app)/bots/new/page.tsx`)  
Last updated: 2026-08-12

| Property | Class |
| --- | --- |
| Form | `mt-8 flex flex-col gap-4` (same as auth) |
| Fields | `Input` name; `Textarea` welcome + system prompt |
| Errors | `text-sm text-error` + `role="alert"` |
| Actions | primary submit + secondary Cancel → `/bots` |

**Pattern notes:**  
`useActionState` + `createBot` (redirect to `/bots/[id]`). At-limit handled on the RSC page before rendering the form.

### Bot detail

File: `app/(app)/bots/[id]/page.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Layout | `max-w-2xl` |
| Breadcrumb | `text-sm`; link `text-accent` |
| Title | `font-display text-3xl font-semibold tracking-tight text-text-primary` |
| Body | `text-base leading-relaxed text-text-secondary` |
| Primary CTA | `Open chat` → `/bots/[id]/chat` |
| Field labels | `text-sm font-medium text-text-primary`; values `whitespace-pre-wrap` |
| Documents section | `mt-10`; upload + list below `EditBotForm` |
| Embed section | `EmbedSnippet` after documents |

**Pattern notes:**  
Own-bot RLS filter on load. Settings are editable (`EditBotForm`). Documents: upload auto-ingests; Retry on pending / processing / failed. Primary path into chat is **Open chat**. Embed snippet uses `public_id`, not the bot UUID.

### Embed snippet

File: `components/bots/EmbedSnippet.tsx` (on `app/(app)/bots/[id]/page.tsx`)  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | Snippet `bg-surface-secondary` |
| Border | `border border-border` |
| Border radius | `rounded-md` |
| Text — primary | Section `font-display text-xl font-semibold tracking-tight text-text-primary`; code `text-sm text-text-primary` |
| Text — secondary | Help `text-sm leading-relaxed text-text-secondary` |
| Spacing | Section `mt-10`; snippet `mt-4 px-3 py-2.5`; actions `mt-4 gap-2` |
| Hover / focus | Copy / Preview = secondary Button |
| Shadow | none |
| Accent usage | none |
| Status | Copied `text-sm text-text-secondary` + `role="status"` |

**Pattern notes:**  
Operate section, not a card. Copy uses `navigator.clipboard`. Preview opens `/w/{public_id}` in a new tab. Do not invent a third button variant.

### Widget panel

File: `components/widget/WidgetPanel.tsx` (page `app/w/[publicId]/embed/page.tsx`)  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | Panel `bg-surface`; header `bg-surface-secondary` |
| Border | Header `border-b border-border`; composer dock `border-t border-border` |
| Border radius | none on the iframe panel (host launcher rounds the frame) |
| Text — primary | Name `font-display text-sm font-semibold tracking-tight text-text-primary` |
| Text — secondary | Caption `text-xs font-medium text-text-muted`; errors `text-sm text-error` |
| Spacing | Header `px-4 py-3`; body `p-4 gap-4`; dock `p-4` |
| Hover / focus | Send uses shared `ChatComposer` / Button |
| Shadow | none |
| Accent usage | none in the panel (launcher accent lives in `widget.js`) |

**Pattern notes:**  
Match `ChatMessage` / `HeroChatMock` bubbles for welcome and replies. Live composer reuses `ChatComposer` (`inputId="widget-composer"`). Streaming uses `ChatMessage` `streaming`. Errors: `text-sm text-error` + `role="alert"` — no billing link (visitors are not the owner). Badge: `text-xs font-medium text-text-muted` “Powered by DocuChat” unless `remove_branding`.

### Widget preview

File: `app/w/[publicId]/page.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | Page `bg-background`; banner `bg-accent-muted` |
| Border | Banner `border-b border-border` |
| Layout | Article `max-w-[720px] px-6 py-16` |
| Title | `font-display text-3xl font-semibold tracking-tight text-text-primary` |
| Body | `text-base leading-relaxed text-text-secondary` |
| Caption | `text-sm font-medium text-text-muted` |
| Shadow | none |

**Pattern notes:**  
Public, no app shell. Honest banner that this is a DocuChat preview. Unknown ids: same title/body empty pattern as other operate 404s. Launcher comes from `public/widget.js`.

### Usage meter

File: `components/ui/UsageMeter.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Label | `text-sm font-medium text-text-primary` |
| Count | `text-sm tabular-nums text-text-secondary` (at limit: `text-warning`) |
| Track | `h-1.5 rounded-sm bg-surface-secondary` |
| Fill | `bg-accent` (at limit: `bg-warning`) |

**Pattern notes:**  
Shared by dashboard and billing. Fill width is a single inline `style` percent — tokens cannot express a runtime percentage.

### Billing

File: `app/(app)/settings/billing/page.tsx`  
Last updated: 2026-08-14

| Property | Class |
| --- | --- |
| Layout | `max-w-2xl` |
| Title | `font-display text-3xl font-semibold tracking-tight text-text-primary` |
| Plan badge | `rounded-md bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent` |
| Body | `text-base leading-relaxed text-text-secondary` |
| Status | checkout/setup/listen `text-sm text-text-secondary` + `role="status"` |
| Errors | action errors `text-sm text-error` + `role="alert"` |
| Meters | shared `UsageMeter` (bots, messages, storage) |
| Actions | Free: primary Upgrade to Pro + secondary Upgrade to Business; paid: primary Manage subscription; secondary Back to dashboard |

**Pattern notes:**  
Stripe test-mode copy (card 4242). Checkout/Portal via `BillingActions` (`useActionState` + `startCheckout` / `startPortal`). No cards. Missing keys: setup copy, no fake plan write. `?checkout=success` while still Free hints at `stripe listen`.

### Billing actions

File: `components/billing/BillingActions.tsx`  
Last updated: 2026-08-14

| Property | Class |
| --- | --- |
| Layout | `mt-8 flex flex-col gap-4` |
| Button row | `flex flex-wrap gap-3` |
| Errors | `text-sm text-error` + `role="alert"` |

**Pattern notes:**  
Hidden `plan` input (`pro` / `business`). Same `Button` primary/secondary as the rest of Operate. Pending label “Redirecting…”.

### Edit bot form

File: `components/bots/EditBotForm.tsx`  
Last updated: 2026-08-14

| Property | Class |
| --- | --- |
| Form | `mt-8 flex flex-col gap-4` (same as create / auth) |
| Fields | `Input` name; `Textarea` welcome + system prompt; native checkbox branding |
| Checkbox | `h-4 w-4 rounded-sm border-border text-accent focus:ring-1 focus:ring-accent disabled:opacity-60` |
| Checkbox label | `flex items-start gap-2 text-sm`; help `font-normal leading-relaxed` |
| Upgrade link | `font-medium text-accent hover:text-accent-dark focus-visible:ring-1 focus-visible:ring-accent` |
| Errors | `text-sm text-error` + `role="alert"` |
| Success | `text-sm text-text-secondary` + `role="status"` |
| Actions | primary submit “Save settings” |

**Pattern notes:**  
`useActionState` + `updateBot`. Hidden `bot_id`. Checkbox `name="remove_branding"` value `on`; disabled on Free with billing upgrade link. First checkbox in the app — native input, no new primitive.

### Document upload

File: `components/bots/DocumentUpload.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | Dropzone idle `bg-surface-secondary`; drag `bg-accent-muted` |
| Border | `border border-dashed border-border`; drag `border-accent` |
| Border radius | `rounded-md` |
| Text — primary | Section `font-display text-xl font-semibold tracking-tight text-text-primary`; dropzone title `text-sm font-medium text-text-primary` |
| Text — secondary | Quota / help `text-sm text-text-secondary` |
| Spacing | Header gap `gap-2`; dropzone `px-4 py-8`; errors `mt-3` |
| Hover / focus | Links `hover:text-accent-dark focus-visible:ring-1 focus-visible:ring-accent`; Choose file is a non-interactive span inside the label |
| Shadow | none |
| Accent usage | Drag state + upgrade links `text-accent` → `/settings/billing` |
| Errors | `text-sm text-error` + `role="alert"` |

**Pattern notes:**  
Dropzone is a `<label htmlFor>` around the file input (no nested button). Inner text/span use `pointer-events-none` so drag accent (`bg-accent-muted`) stays over the center. Server Action `createDocument` then browser Storage upload; on Storage failure call `deleteDocument`. After upload succeeds, client POSTs `/api/ingest`. Accept `.pdf,.md,.txt`.

### Documents list

File: `components/bots/DocumentsList.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Background | none (divider list, not a card) |
| Border | List `divide-y divide-border border-y border-border` |
| Border radius | none on list |
| Text — primary | Filename `font-medium text-text-primary`; empty title `font-display text-lg font-semibold tracking-tight text-text-primary` |
| Text — secondary | Meta `text-sm text-text-secondary`; empty body `text-base leading-relaxed text-text-secondary` |
| Spacing | Section `mt-8`; rows `py-4` + `gap-3`; actions `gap-2` |
| Hover / focus | Retry / Delete = secondary Button |
| Shadow | none |
| Accent usage | none |
| Errors | `text-sm text-error` + `role="alert"`; failed doc error under meta |

**Pattern notes:**  
Same divider-list pattern as Bots list. Status labels via `formatDocumentStatus`. Pending / processing / failed rows show **Retry** (`force: true`). Delete uses `window.confirm`. `deleteDocument` removes Storage object + row.

### Chat thread

File: `components/chat/ChatThread.tsx` (page `app/(app)/bots/[id]/chat/page.tsx`)  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Layout | Column fills a fixed viewport slice `h-[calc(100dvh-14rem)] overflow-hidden`; message list `flex-1 overflow-y-auto` so long threads scroll inside the panel |
| Panel | `rounded-lg border border-border bg-surface shadow-card` |
| Header | `bg-surface-secondary` + `border-b border-border`; caption `text-xs font-medium text-text-muted` |
| Title | `font-display text-3xl font-semibold tracking-tight text-text-primary` |
| Body | `text-base leading-relaxed text-text-secondary` |
| Breadcrumb | `text-sm`; links `text-accent hover:text-accent-dark focus-visible:ring-1 focus-visible:ring-accent` |
| Empty title | `font-display text-xl font-semibold tracking-tight text-text-primary` |
| Composer dock | `sticky bottom-0 border-t border-border bg-surface p-4 sm:p-5` |
| Errors | `text-sm text-error` + `role="alert"`; 429 adds billing link `text-accent` |
| Shadow | `shadow-card` on the panel |

**Pattern notes:**  
Operate chat, not a new visual world. Match `HeroChatMock` chrome. Composer disabled when the bot has no `ready` documents. Welcome bubble only when the stored thread is empty.

### Chat message

File: `components/chat/ChatMessage.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| User bubble | `ml-auto max-w-[85%] rounded-md bg-accent-muted px-3.5 py-2.5 text-sm leading-relaxed text-text-primary` |
| Assistant bubble | `mr-auto max-w-[90%] rounded-md border border-border bg-surface-secondary px-3.5 py-2.5 text-sm leading-relaxed text-text-primary` |
| Streaming | Three muted dots (`ChatThinkingDots`) while the assistant bubble is empty; honor `prefers-reduced-motion` |
| Shadow | none |
| Accent usage | user bubble fill `bg-accent-muted` only — no rainbow |

**Pattern notes:**  
Same tokens as the landing `HeroChatMock`. Do not add markdown rendering or citation chips in MVP. Waiting state is bouncing dots, not a caret.

### Chat composer

File: `components/chat/ChatComposer.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Row | `flex items-end gap-2 rounded-md border border-border bg-surface px-3 py-2.5` |
| Field | `bg-transparent text-sm leading-relaxed text-text-primary placeholder:text-text-muted`; `sr-only` label |
| Send | primary `Button` `px-3 py-1.5 text-xs`; `disabled:opacity-60` |
| Focus | textarea `focus:outline-none`; send uses `focus-visible` from Button |
| Shadow | none |

**Pattern notes:**  
Enter sends; Shift+Enter newline. Not the labeled `Textarea` form control — this is the chat dock.

### Chat thinking dots

File: `components/chat/ChatThinkingDots.tsx`  
Last updated: 2026-08-13

| Property | Class |
| --- | --- |
| Layout | `inline-flex items-center gap-1` |
| Dots | `size-1.5 rounded-full bg-text-muted` |
| Motion | `.chat-thinking-dot` bounce in `app/globals.css`; delays 0 / 0.16s / 0.32s |
| Reduced motion | animation none; `opacity: 0.7` |
| A11y | `role="status"` `aria-label="Thinking"` |

**Pattern notes:**  
Shown in the assistant bubble only while streaming and content is empty. Token fill only — not accent.

---

## Button Standard

Primary / secondary patterns in the Button entry. Do not invent a third button radius or padding without updating tokens + this registry.

## Input Standard

`components/ui/Input.tsx`: label wraps field; `bg-surface border-border rounded-md px-3 py-2`; focus `ring-1 ring-accent`; errors `text-error`. Multi-line: `Textarea` with the same chrome. Do not invent alternate field chrome without updating this registry + DESIGN.md.

## Card Standard

`bg-surface border border-border rounded-lg p-6 shadow-card`. Highlighted interactive cards may add `border-accent ring-1 ring-accent`. Elevation is `shadow-card` only.

## Focus State Standard

Text fields: `focus:outline-none focus:ring-1 focus:ring-accent`. Links and buttons: `focus-visible:ring-1 focus-visible:ring-accent` so a mouse click does not leave a ring.

## Layout Standard

- Marketing: `max-w-[1120px] px-6`, header `h-16`, sections `py-20 sm:py-24`
- App: `max-w-[1440px]`, padding `px-4 py-8 sm:px-8`, top nav only; `overflow-x-hidden` on `body`; usable from 300px

## Motion Standard

Landing: `.animate-fade-up`, `.animate-fade-up-delay`, `.animate-hero-mock` in `app/globals.css`. Always pair with `prefers-reduced-motion` kill-switch already defined there.
