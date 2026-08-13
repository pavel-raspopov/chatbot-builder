import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ChatThread, type ChatThreadMessage } from "@/components/chat/ChatThread";
import { createClient } from "@/lib/supabase/server";

type ChatPageProps = {
  params: Promise<{ id: string }>;
};

function isChatRole(value: string): value is ChatThreadMessage["role"] {
  return value === "user" || value === "assistant";
}

export default async function BotChatPage({
  params,
}: ChatPageProps): Promise<ReactNode> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Chat
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          You need to sign in to chat with this bot.
        </p>
      </div>
    );
  }

  const { data: bot, error: botError } = await supabase
    .from("bots")
    .select("id, name, welcome_message")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (botError) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Chat
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load this bot. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bot not found
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          This bot does not exist or you do not have access to it.
        </p>
        <div className="mt-8">
          <Button href="/bots" variant="secondary">
            Back to bots
          </Button>
        </div>
      </div>
    );
  }

  const [readyResult, conversationsResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("bot_id", bot.id)
      .eq("user_id", user.id)
      .eq("status", "ready"),
    supabase
      .from("conversations")
      .select("id")
      .eq("bot_id", bot.id)
      .eq("user_id", user.id)
      .eq("source", "app")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (readyResult.error || conversationsResult.error) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Chat
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load this chat. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  const conversationId = conversationsResult.data?.[0]?.id ?? null;
  let initialMessages: ChatThreadMessage[] = [];

  if (conversationId) {
    const messagesResult = await supabase
      .from("messages")
      .select("id, role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesResult.error) {
      return (
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
            Chat
          </h1>
          <p className="mt-3 text-base leading-relaxed text-error" role="alert">
            Could not load this chat. Refresh the page or try again shortly.
          </p>
        </div>
      );
    }

    initialMessages = (messagesResult.data ?? []).flatMap((row) => {
      if (!isChatRole(row.role)) {
        return [];
      }
      return [{ id: row.id, role: row.role, content: row.content }];
    });
  }

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <ChatThread
        botId={bot.id}
        botName={bot.name}
        welcomeMessage={bot.welcome_message}
        conversationId={conversationId}
        initialMessages={initialMessages}
        hasReadyDocuments={(readyResult.count ?? 0) > 0}
      />
    </div>
  );
}
