import { NextResponse } from "next/server";
import { getOrCreateAppConversation, insertMessage } from "@/lib/chat/persist";
import { streamGroundedAnswer, UNKNOWN_FROM_DOCS } from "@/lib/rag/answer";
import { retrieveChunks, type RetrievedChunk } from "@/lib/rag/retrieve";
import { createClient } from "@/lib/supabase/server";
import { consumeMessageQuota } from "@/lib/usage";

export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 4000;

type ChatBody = {
  botId: string;
  conversationId: string | null;
  message: string;
};

function readChatBody(value: unknown): ChatBody {
  if (typeof value !== "object" || value === null) {
    return { botId: "", conversationId: null, message: "" };
  }

  const botIdValue = "botId" in value ? value.botId : undefined;
  const conversationIdValue =
    "conversationId" in value ? value.conversationId : undefined;
  const messageValue = "message" in value ? value.message : undefined;

  const botId = typeof botIdValue === "string" ? botIdValue.trim() : "";
  const message = typeof messageValue === "string" ? messageValue.trim() : "";
  const conversationId =
    typeof conversationIdValue === "string" && conversationIdValue.trim()
      ? conversationIdValue.trim()
      : null;

  return { botId, conversationId, message };
}

function jsonError(error: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

function encodeSse(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(request: Request): Promise<Response> {
  try {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const body = readChatBody(raw);
    if (!body.botId) {
      return jsonError("Missing bot id.", 400);
    }
    if (!body.message) {
      return jsonError("Message is required.", 400);
    }
    if (body.message.length > MAX_MESSAGE_LENGTH) {
      return jsonError("Message is too long.", 400);
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError("You need to sign in to chat.", 401);
    }

    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("id, system_prompt")
      .eq("id", body.botId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (botError) {
      console.error("[api/chat] load bot", botError);
      return jsonError("Could not load this bot. Please try again.", 500);
    }

    if (!bot) {
      return jsonError("Bot not found.", 404);
    }

    let chunks: RetrievedChunk[];
    try {
      chunks = await retrieveChunks(supabase, bot.id, body.message);
    } catch (error) {
      console.error("[api/chat] retrieve", error);
      return jsonError(
        "Could not search this bot’s knowledge. Please try again.",
        500,
      );
    }

    const quota = await consumeMessageQuota(supabase, user.id);
    if (!quota.ok) {
      return jsonError(quota.error, quota.statusCode);
    }

    const conversationId = await getOrCreateAppConversation(supabase, {
      botId: bot.id,
      userId: user.id,
      conversationId: body.conversationId,
    });

    const stream = new ReadableStream({
      async start(controller) {
        let assistantText = "";
        try {
          if (chunks.length === 0) {
            assistantText = UNKNOWN_FROM_DOCS;
            controller.enqueue(
              encodeSse({ type: "delta", text: UNKNOWN_FROM_DOCS }),
            );
          } else {
            for await (const delta of streamGroundedAnswer({
              botSystemPrompt: bot.system_prompt,
              chunks,
              userMessage: body.message,
            })) {
              assistantText += delta;
              controller.enqueue(encodeSse({ type: "delta", text: delta }));
            }
            if (!assistantText.trim()) {
              assistantText = UNKNOWN_FROM_DOCS;
              controller.enqueue(
                encodeSse({ type: "delta", text: UNKNOWN_FROM_DOCS }),
              );
            }
          }

          try {
            await insertMessage(supabase, {
              conversationId,
              role: "user",
              content: body.message,
            });
            await insertMessage(supabase, {
              conversationId,
              role: "assistant",
              content: assistantText,
            });
          } catch (persistError) {
            console.error("[api/chat] persist turn", persistError);
          }

          controller.enqueue(encodeSse({ type: "done", conversationId }));
          controller.close();
        } catch (error) {
          console.error("[api/chat] stream", error);
          controller.enqueue(
            encodeSse({
              type: "error",
              error: "Could not generate a reply. Please try again.",
            }),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[api/chat] POST", error);
    return jsonError("Something went wrong while chatting. Please try again.", 500);
  }
}
