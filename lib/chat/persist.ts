import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type AppSupabase = SupabaseClient<Database>;

export async function getOrCreateAppConversation(
  supabase: AppSupabase,
  params: {
    botId: string;
    userId: string;
    conversationId: string | null;
  },
): Promise<string> {
  if (params.conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", params.conversationId)
      .eq("bot_id", params.botId)
      .eq("user_id", params.userId)
      .eq("source", "app")
      .maybeSingle();

    if (error) {
      console.error("[lib/chat/persist] load conversation", error);
      throw new Error("Could not load this conversation.");
    }

    if (data) {
      return data.id;
    }
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({
      bot_id: params.botId,
      user_id: params.userId,
      source: "app",
    })
    .select("id")
    .single();

  if (createError || !created) {
    console.error("[lib/chat/persist] create conversation", createError);
    throw new Error("Could not start this conversation.");
  }

  return created.id;
}

export async function getOrCreateWidgetConversation(
  supabase: AppSupabase,
  params: {
    botId: string;
    conversationId: string | null;
  },
): Promise<string> {
  if (params.conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", params.conversationId)
      .eq("bot_id", params.botId)
      .eq("source", "widget")
      .maybeSingle();

    if (error) {
      console.error("[lib/chat/persist] load widget conversation", error);
      throw new Error("Could not load this conversation.");
    }

    if (data) {
      return data.id;
    }
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({
      bot_id: params.botId,
      user_id: null,
      source: "widget",
    })
    .select("id")
    .single();

  if (createError || !created) {
    console.error("[lib/chat/persist] create widget conversation", createError);
    throw new Error("Could not start this conversation.");
  }

  return created.id;
}

export async function insertMessage(
  supabase: AppSupabase,
  params: {
    conversationId: string;
    role: "user" | "assistant";
    content: string;
  },
): Promise<void> {
  const { error } = await supabase.from("messages").insert({
    conversation_id: params.conversationId,
    role: params.role,
    content: params.content,
  });

  if (error) {
    console.error("[lib/chat/persist] insert message", error);
    throw new Error("Could not save this message.");
  }
}
