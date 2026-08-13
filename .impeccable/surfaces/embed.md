---
version: 1
slug: "embed"
primary_target: "app/w/[publicId]/page.tsx"
related_targets: ["app/w/[publicId]/embed/page.tsx", "components/widget/WidgetPanel.tsx", "public/widget.js", "components/bots/EmbedSnippet.tsx", "route:/w/[publicId]", "route:/w/[publicId]/embed", "route:/api/widget/chat"]
---

# Surface: Embed preview (`/w/[publicId]`)

**Mode:** Operate (public, no app shell)  
**Primary target:** `app/w/[publicId]/page.tsx`

## Visitor success

See how the widget looks on a sample site: honest preview banner, floating launcher, panel with the bot’s welcome, a live composer that streams grounded answers, and a DocuChat badge unless branding is removed. Unknown public ids get a calm not-found state.

## Composition

No AppNavbar. Preview: accent-muted banner, `max-w-[720px]` sample article, `widget.js` script. Embed iframe: `WidgetPanel` fills the viewport — header, assistant welcome bubble, live `ChatComposer`, streamed `ChatMessage` replies, optional badge. Chat posts to `/api/widget/chat` from the iframe (same origin).

## Visual inheritance

Chat bubble tokens from `ChatMessage` / `HeroChatMock`. Operate type scale. Launcher on the host page uses token hex in `widget.js` (no Tailwind on customer sites). Errors use `text-error` without a billing link.
