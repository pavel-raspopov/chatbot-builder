import type { ReactNode } from "react";

export function ChatThinkingDots(): ReactNode {
  return (
    <span
      className="chat-thinking inline-flex items-center gap-1"
      role="status"
      aria-label="Thinking"
    >
      <span className="chat-thinking-dot size-1.5 rounded-full bg-text-muted" />
      <span className="chat-thinking-dot size-1.5 rounded-full bg-text-muted" />
      <span className="chat-thinking-dot size-1.5 rounded-full bg-text-muted" />
    </span>
  );
}
