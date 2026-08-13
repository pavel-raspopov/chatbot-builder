# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume; verify against `project-brief.md`, `architecture.md`, and `project-overview.md`
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap ingest, chat, and Stripe paths in try/catch, log failures, never let one failure crash everything

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Prefer narrowing over `as`. `as` is allowed after `JSON.parse` / `FormData.get` when you immediately narrow the value; do not use `as` to silence real type errors
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary

---

## Next.js Conventions

- App Router only — no Pages Router
- All components are Server Components by default
- Only add `"use client"` when the component requires:
  - useState or useReducer
  - useEffect
  - Browser APIs
  - Event listeners
  - Client-only third-party libraries
- Never add `"use client"` to layout files unless absolutely required
- Data fetching happens in Server Components — never fetch in Client Components directly for initial page data
- Route handlers live in `app/api/` — keep handlers thin; put business logic in `lib/`
- Server Actions live in `actions/` — never define Server Actions inline in components
- Always read Next.js documentation in `node_modules/next/dist/docs/` before implementing Next-specific features

---

## File and Folder Naming

- Folders: kebab-case — `bot-detail`, `settings`
- Component files: PascalCase — `ChatThread.tsx`, `PricingTable.tsx`
- Utility files: camelCase — `plans.ts`, `chunk.ts`
- API route files: always `route.ts`
- Server Action files: camelCase — `bots.ts`, `billing.ts`
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { ChatMessage } from "@/components/chat/ChatMessage";

// 3. Type definitions
type Props = {
  botId: string;
};

// 4. Component
export function ComponentName({ botId }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared
- No hardcoded colors or raw Tailwind palette classes — use tokens from `ui-tokens.md`
- Dynamic layout values that cannot be tokens (e.g. meter `width` percent) may use a single inline style

---

## API Route Handlers

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // validate body
    // business logic
    return NextResponse.json({ success: true, chunkCount: result.chunkCount });
  } catch (error) {
    console.error("[api/chat]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

- Every route handler has a try/catch
- Every route handler validates the request body before processing
- Errors are logged with the route path as prefix: `[api/chat]`
- Always return `{ success: boolean, error?: string }` plus any extra fields the client needs (`chunkCount`, `data`, …)
- Never return a bare payload without `success`

---

## Server Actions

Two shapes — pick by how the UI consumes the action:

### A) CRUD / button mutations (default)

Return a result object. Do not throw application errors.

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBot(input: CreateBotInput) {
  try {
    const supabase = await createClient();
    // validate + plan gates
    // write to DB
    revalidatePath("/bots");
    return { success: true as const };
  } catch (error) {
    console.error("[actions/bots]", error);
    return { success: false as const, error: "Failed to create bot" };
  }
}
```

- Every CRUD Server Action has a try/catch
- Return `{ success: boolean, error?: string }` (optionally `data`)
- Call `revalidatePath` / `updateTag` after mutations that affect page data
- Enforce plan limits server-side before writes

### B) Form actions with `useActionState` (auth, multi-field forms)

Match Next.js forms guide + React `useActionState`: first arg is previous state; return a typed state on validation / provider failure. On success, call `redirect()` (or return a success message when no navigation is needed).

```typescript
"use server";

import { redirect, unstable_rethrow } from "next/navigation";

export type AuthActionState = {
  error: string | null;
  message: string | null;
};

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    // validate → return { error, message: null }
    // supabase call → return error state on failure
    redirect("/dashboard"); // success — control-flow throw
  } catch (error) {
    unstable_rethrow(error); // rethrow redirect / notFound
    console.error("[actions/auth]", error);
    return { error: "Something went wrong.", message: null };
  }
}
```

- Do **not** force `{ success }` onto `useActionState` flows — the hook needs a stable UI state shape
- Always `unstable_rethrow(error)` inside catch so `redirect()` / `notFound()` still work (Next.js 16.3 docs; the API is still marked unstable)
- `redirect()` after successful auth is preferred over returning success and navigating on the client

---

## Supabase Client Usage

```typescript
// Browser — Client Components only
import { createClient } from "@/lib/supabase/client";

// Server — Server Components, Route Handlers, Server Actions
import { createClient } from "@/lib/supabase/server";

// Privileged server-only (ingest, widget after public_id check)
import { createAdminClient } from "@/lib/supabase/admin";
```

- Never import the admin/service-role client into Client Components
- Prefer RLS + user client for owner CRUD
- Always check `error` from Supabase responses
- Plan numbers (bots, messages, storage) are enforced in Server Actions / Route Handlers from `lib/plans.ts`. RLS is ownership only — do not duplicate plan limits in SQL
- Lock quota/identity columns with Postgres column privileges (same pattern as `profiles`). Authenticated `UPDATE` on `documents` is `status` and `error` only
- Delete Storage objects with the Storage API (`storage.remove`), not SQL. See Supabase “Delete Objects” docs

---

## RAG / AI Code

- Keep chunking, embedding, and retrieval in `lib/rag/`
- Call Gemini only from the server via `lib/gemini.ts` — never from the browser with a secret key
- Chat and widget handlers must check message quotas before calling the model
- Log provider errors without leaking API keys

---

## Stripe

- Secret key and webhook secret only on the server
- Verify webhook signatures
- Update plan from webhook (or verified Checkout session) — never trust client-reported plan

---

## Styling

- Use design tokens from `context/ui-tokens.md` only
- Never hardcode hex values or raw Tailwind palette classes (`bg-blue-500`, etc.)
- After building UI components, run `/imprint` and update `ui-registry.md`

---

## Documentation Hygiene

- Update `context/progress-tracker.md` after every completed feature
- Update `context/ui-registry.md` after every new UI component
- Do not invent features outside `project-brief.md` / `project-overview.md` out-of-scope lists
