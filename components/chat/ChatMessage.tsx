import type { ReactNode } from "react";
import { ChatThinkingDots } from "@/components/chat/ChatThinkingDots";

export type ChatMessageRole = "user" | "assistant";

export type ChatMessageProps = {
  role: ChatMessageRole;
  content: string;
  streaming?: boolean;
};

export function ChatMessage({
  role,
  content,
  streaming = false,
}: ChatMessageProps): ReactNode {
  const isUser = role === "user";
  const showThinking = streaming && content.trim().length === 0;

  return (
    <div
      className={
        isUser
          ? "ml-auto max-w-[85%] rounded-md bg-accent-muted px-3.5 py-2.5 text-sm leading-relaxed text-text-primary"
          : "mr-auto max-w-[90%] rounded-md border border-border bg-surface-secondary px-3.5 py-2.5 text-sm leading-relaxed text-text-primary"
      }
    >
      {showThinking ? (
        <ChatThinkingDots />
      ) : (
        <p className="whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}
