"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatStreamError, streamChatReply } from "@/lib/chat/streamClient";

export type ChatThreadMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatThreadProps = {
  botId: string;
  botName: string;
  welcomeMessage: string;
  conversationId: string | null;
  initialMessages: ChatThreadMessage[];
  hasReadyDocuments: boolean;
};

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatThread({
  botId,
  botName,
  welcomeMessage,
  conversationId: initialConversationId,
  initialMessages,
  hasReadyDocuments,
}: ChatThreadProps): ReactNode {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [messages, setMessages] = useState<ChatThreadMessage[]>(initialMessages);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const showWelcome = messages.length === 0 && welcomeMessage.trim().length > 0;

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages, streamingId]);

  async function handleSend(text: string): Promise<void> {
    if (!hasReadyDocuments || sending) {
      return;
    }

    const userMessage: ChatThreadMessage = {
      id: nextId(),
      role: "user",
      content: text,
    };
    const assistantId = nextId();
    const assistantMessage: ChatThreadMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setError(null);
    setErrorStatus(null);
    setSending(true);
    setStreamingId(assistantId);
    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const result = await streamChatReply({
        botId,
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
      const status =
        caught instanceof ChatStreamError ? caught.statusCode : 500;
      if (status >= 500) {
        console.error("[chat]", caught);
      }
      const message =
        caught instanceof ChatStreamError
          ? caught.message
          : "Could not send that message. Please try again.";
      setError(message);
      setErrorStatus(status);
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
    <div className="flex h-[calc(100dvh-14rem)] min-h-0 min-w-0 flex-col overflow-hidden">
      <p className="text-sm text-text-secondary">
        <Link
          href="/bots"
          className="font-medium text-accent hover:text-accent-dark focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          Bots
        </Link>
        <span className="text-text-muted"> / </span>
        <Link
          href={`/bots/${botId}`}
          className="font-medium text-accent hover:text-accent-dark focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          {botName}
        </Link>
        <span className="text-text-muted"> / Chat</span>
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary">
        Chat
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary">
        Ask from this bot’s indexed documents. Answers stay grounded in what you
        uploaded.
      </p>

      <div className="mt-8 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <div className="flex items-center gap-2 border-b border-border bg-surface-secondary px-4 py-3">
          <span className="size-2.5 rounded-full bg-border-muted" />
          <span className="size-2.5 rounded-full bg-border-muted" />
          <span className="size-2.5 rounded-full bg-border-muted" />
          <span className="ml-2 text-xs font-medium text-text-muted">
            {botName} · in-app chat
          </span>
        </div>

        <div
          ref={scrollerRef}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 sm:p-6"
          aria-live="polite"
        >
          {!hasReadyDocuments ? (
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
                No indexed documents yet
              </h2>
              <p className="mt-2 max-w-md text-base leading-relaxed text-text-secondary">
                Upload a PDF, Markdown, or text file so this bot can answer from
                your knowledge.
              </p>
              <p className="mt-4">
                <Link
                  href={`/bots/${botId}`}
                  className="font-medium text-accent hover:text-accent-dark focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  Upload documents
                </Link>
              </p>
            </div>
          ) : (
            <>
              {showWelcome ? (
                <ChatMessage role="assistant" content={welcomeMessage} />
              ) : null}
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  streaming={message.id === streamingId}
                />
              ))}
            </>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-border bg-surface p-4 sm:p-5">
          {error ? (
            <p className="mb-3 text-sm text-error" role="alert">
              {error}
              {errorStatus === 429 ? (
                <>
                  {" "}
                  <Link
                    href="/settings/billing"
                    className="font-medium text-accent hover:text-accent-dark focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    View billing
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
          <ChatComposer
            disabled={!hasReadyDocuments}
            sending={sending}
            onSend={(text) => {
              void handleSend(text);
            }}
          />
        </div>
      </div>
    </div>
  );
}
