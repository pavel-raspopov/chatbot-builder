import type { ReactNode } from "react";

export function HeroChatMock(): ReactNode {
  return (
    <div
      aria-hidden="true"
      className="animate-hero-mock mx-auto w-full max-w-[720px] overflow-hidden rounded-lg border border-border bg-surface shadow-card"
    >
      <div className="flex items-center gap-2 border-b border-border bg-surface-secondary px-4 py-3">
        <span className="size-2.5 rounded-full bg-border-muted" />
        <span className="size-2.5 rounded-full bg-border-muted" />
        <span className="size-2.5 rounded-full bg-border-muted" />
        <span className="ml-2 text-xs font-medium text-text-muted">
          Product docs bot · in-app chat
        </span>
      </div>
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="ml-auto max-w-[85%] rounded-md bg-accent-muted px-3.5 py-2.5 text-sm text-text-primary">
          How do I rotate API keys without downtime?
        </div>
        <div className="mr-auto max-w-[90%] rounded-md border border-border bg-surface-secondary px-3.5 py-2.5 text-sm leading-relaxed text-text-primary">
          From your docs: create a second key, update services to accept both,
          then revoke the old key after traffic moves. DocuChat only answers
          from uploaded knowledge — if a step is missing, it says so.
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
          <span className="flex-1 text-sm text-text-muted">
            Ask from your docs…
          </span>
          <span className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            Send
          </span>
        </div>
      </div>
    </div>
  );
}
