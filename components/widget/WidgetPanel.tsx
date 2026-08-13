"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatStreamError, streamWidgetReply } from "@/lib/chat/streamClient";

export type WidgetPanelProps = {
  publicId: string;
  botName: string;
  welcomeMessage: string;
  showBranding: boolean;
};

type PanelMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WidgetPanel({
  publicId,
  botName,
  welcomeMessage,
  showBranding,
}: WidgetPanelProps): ReactNode {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const welcome = welcomeMessage.trim();
  const showWelcome = messages.length === 0 && welcome.length > 0;

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages, streamingId]);

  async function handleSend(text: string): Promise<void> {
    if (sending) {
      return;
    }

    const userMessage: PanelMessage = {
      id: nextId(),
      role: "user",
      content: text,
    };
    const assistantId = nextId();
    const assistantMessage: PanelMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setError(null);
    setSending(true);
    setStreamingId(assistantId);
    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const result = await streamWidgetReply({
        publicId,
        conversationId,
        message: text,
        onDelta: (chunk) => {
          setMessages((current) =>
            current.map((entry) =>
              entry.id === assistantId
                ? { ...entry, content: `${entry.content}${chunk}` }
                : entry,
            ),
          );
        },
      });
      setConversationId(result.conversationId);
    } catch (caught) {
      const status = caught instanceof ChatStreamError ? caught.statusCode : 500;
      if (status >= 500) {
        console.error("[widget]", caught);
      }
      const message =
        caught instanceof ChatStreamError
          ? caught.message
          : "Could not send that message. Please try again.";
      setError(message);
      setMessages((current) =>
        current.filter(
          (entry) => entry.id !== userMessage.id && entry.id !== assistantId,
        ),
      );
    } finally {
      setSending(false);
      setStreamingId(null);
    }
  }

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

      <div
        ref={scrollerRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
        aria-live="polite"
      >
        {showWelcome ? (
          <ChatMessage role="assistant" content={welcome} />
        ) : null}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            streaming={message.id === streamingId}
          />
        ))}
      </div>

      <div className="border-t border-border bg-surface p-4">
        {error ? (
          <p className="mb-3 text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
        <ChatComposer
          inputId="widget-composer"
          disabled={false}
          sending={sending}
          onSend={(text) => {
            void handleSend(text);
          }}
        />
        {showBranding ? (
          <p className="mt-3 text-center text-xs font-medium text-text-muted">
            Powered by DocuChat
          </p>
        ) : null}
      </div>
    </div>
  );
}
