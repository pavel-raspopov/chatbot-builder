---
version: 1
slug: "chat"
primary_target: "app/(app)/bots/[id]/chat/page.tsx"
related_targets: ["components/chat/ChatThread.tsx", "components/chat/ChatMessage.tsx", "components/chat/ChatComposer.tsx", "app/api/chat/route.ts", "route:/bots/[id]/chat"]
---

# Surface: In-app chat (`/bots/[id]/chat`)

**Mode:** Operate  
**Primary target:** `app/(app)/bots/[id]/chat/page.tsx`

## Visitor success

Ask a question against this bot’s indexed docs, see a streaming grounded answer (or an honest “I don’t know from your docs”), and resume the latest app thread. Blocked when nothing is indexed or the monthly message cap is hit.

## Composition

App shell. Breadcrumb Bots / name / Chat. Panel matching `HeroChatMock`: header caption, stacked bubbles, sticky composer. Empty-docs state links back to upload. No conversation sidebar.

## Visual inheritance

`DESIGN.md` Chat section + `HeroChatMock` bubble tokens. Column `max-w-[720px]`. Tokens only.
