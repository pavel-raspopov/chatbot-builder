import type { ReactNode } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/Button";

export type WidgetPanelProps = {
  botName: string;
  welcomeMessage: string;
  showBranding: boolean;
};

export function WidgetPanel({
  botName,
  welcomeMessage,
  showBranding,
}: WidgetPanelProps): ReactNode {
  const welcome = welcomeMessage.trim();

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-surface">
      <header className="border-b border-border bg-surface-secondary px-4 py-3">
        <p className="font-display text-sm font-semibold tracking-tight text-text-primary">
          {botName}
        </p>
        <p className="mt-0.5 text-xs font-medium text-text-muted">
          Ask from your docs
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {welcome.length > 0 ? (
          <ChatMessage role="assistant" content={welcome} />
        ) : null}
        <p className="text-sm leading-relaxed text-text-secondary">
          Chat replies are not connected in this preview yet.
        </p>
      </div>

      <div className="border-t border-border bg-surface p-4">
        <div className="flex items-end gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
          <label className="sr-only" htmlFor="widget-composer">
            Message
          </label>
          <textarea
            id="widget-composer"
            name="message"
            rows={2}
            disabled
            placeholder="Ask from your docs…"
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-60"
          />
          <Button
            type="button"
            disabled
            className="shrink-0 px-3 py-1.5 text-xs disabled:opacity-60"
          >
            Send
          </Button>
        </div>
        {showBranding ? (
          <p className="mt-3 text-center text-xs font-medium text-text-muted">
            Powered by DocuChat
          </p>
        ) : null}
      </div>
    </div>
  );
}
