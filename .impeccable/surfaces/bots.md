---
version: 1
slug: "bots"
primary_target: "app/(app)/bots/page.tsx"
related_targets: ["components/bots/BotsList.tsx", "components/bots/CreateBotForm.tsx", "components/bots/DocumentUpload.tsx", "components/bots/DocumentsList.tsx", "components/ui/Textarea.tsx", "app/(app)/bots/new/page.tsx", "app/(app)/bots/[id]/page.tsx", "actions/bots.ts", "actions/documents.ts", "route:/bots", "route:/bots/new", "route:/bots/[id]"]
---

# Surface: Bots (`/bots`, `/bots/new`, `/bots/[id]`)

**Mode:** Operate  
**Primary target:** `app/(app)/bots/page.tsx`

## Visitor success

List their bots, create one with name / welcome / system prompt, hit plan bot limits honestly, open detail after create, upload PDF/md/txt under storage quota, delete bots or documents when needed.

## Composition

App shell. List: title, `n / max` meta, empty state or divider list, Create or Upgrade. New: breadcrumb + form (`Input` + `Textarea`). Detail: breadcrumb, name, read-only welcome/prompt, documents dropzone + divider list with status/delete, back link. No cards.

## Visual inheritance

`DESIGN.md` + Bots list / Create bot form / Textarea / Bot detail / Document upload / Documents list registry entries. Content `max-w-2xl`; tokens only.
