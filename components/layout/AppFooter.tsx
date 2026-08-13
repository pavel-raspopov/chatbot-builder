import type { ReactNode } from "react";

export function AppFooter(): ReactNode {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full min-w-0 max-w-[1440px] flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-lg font-semibold text-text-primary">
          DocuChat
        </p>
        <p className="text-sm text-text-muted">Product docs chatbot</p>
      </div>
    </footer>
  );
}
