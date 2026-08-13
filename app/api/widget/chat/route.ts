import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getOrCreateWidgetConversation,
  insertMessage,
} from "@/lib/chat/persist";
import { streamGroundedAnswer, UNKNOWN_FROM_DOCS } from "@/lib/rag/answer";
import { retrieveChunks, type RetrievedChunk } from "@/lib/rag/retrieve";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { consumeOwnerMessageQuota } from "@/lib/usage";
import { widgetCorsHeaders } from "@/lib/widget/cors";
import {
  allowWidgetRequest,
  getClientIp,
  widgetRateLimitPerMinute,
} from "@/lib/widget/rateLimit";

export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 4000;

type WidgetChatBody = {
  publicId: string;
  conversationId: string | null;
  message: string;
};

function readWidgetChatBody(value: unknown): WidgetChatBody {
  if (typeof value !== "object" || value === null) {
    return { publicId: "", conversationId: null, message: "" };
  }

  const publicIdValue = "publicId" in value ? value.publicId : undefined;
  const conversationIdValue =
    "conversationId" in value ? value.conversationId : undefined;
  const messageValue = "message" in value ? value.message : undefined;

  const publicId = typeof publicIdValue === "string" ? publicIdValue.trim() : "";
  const message = typeof messageValue === "string" ? messageValue.trim() : "";
  const conversationId =
    typeof conversationIdValue === "string" && conversationIdValue.trim()
      ? conversationIdValue.trim()
      : null;

  return { publicId, conversationId, message };
}

function jsonError(error: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error },
    { status, headers: widgetCorsHeaders() },
  );
}

function encodeSse(payload: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function isMissingServiceRole(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: widgetCorsHeaders(),
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const body = readWidgetChatBody(raw);
    if (!body.publicId) {
      return jsonError("Missing bot id.", 400);
    }
    if (!body.message) {
      return jsonError("Message is required.", 400);
    }
    if (body.message.length > MAX_MESSAGE_LENGTH) {
      return jsonError("Message is too long.", 400);
    }

    let admin: SupabaseClient<Database>;
    try {
      admin = createAdminClient();
    } catch (error) {
      console.error("[api/widget/chat] admin", error);
      if (isMissingServiceRole(error)) {
        return jsonError(
          "Widget chat is not configured. Set SUPABASE_SERVICE_ROLE_KEY and restart the app.",
          500,
        );
      }
      return jsonError("Could not start widget chat. Please try again.", 500);
    }

    const { data: bot, error: botError } = await admin
      .from("bots")
      .select("id, user_id, system_prompt")
      .eq("public_id", body.publicId)
      .maybeSingle();

    if (botError) {
      console.error("[api/widget/chat] load bot", botError);
      return jsonError("Could not load this bot. Please try again.", 500);
    }

    let ownerPlan: string | null = null;
    if (bot) {
      const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("plan")
        .eq("id", bot.user_id)
        .maybeSingle();

      if (profileError) {
        console.error("[api/widget/chat] load owner plan", profileError);
        return jsonError("Could not load this bot. Please try again.", 500);
      }

      ownerPlan = profile?.plan ?? "free";
    }

    const allowed = allowWidgetRequest({
      ip: getClientIp(request),
      publicId: body.publicId,
      maxPerMinute: widgetRateLimitPerMinute(ownerPlan),
    });

    if (!allowed) {
      return jsonError(
        "Too many messages. Please wait a moment and try again.",
        429,
      );
    }

    if (!bot) {
      return jsonError("Bot not found.", 404);
    }

    const quota = await consumeOwnerMessageQuota(admin, bot.user_id);
    if (!quota.ok) {
      return jsonError(quota.error, quota.statusCode);
    }

    let chunks: RetrievedChunk[];
    try {
      chunks = await retrieveChunks(admin, bot.id, body.message);
    } catch (error) {
      console.error("[api/widget/chat] retrieve", error);
      return jsonError(
        "Could not search this bot’s knowledge. Please try again.",
        500,
      );
    }

    const conversationId = await getOrCreateWidgetConversation(admin, {
      botId: bot.id,
      conversationId: body.conversationId,
    });

    await insertMessage(admin, {
      conversationId,
      role: "user",
      content: body.message,
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
            await insertMessage(admin, {
              conversationId,
              role: "assistant",
              content: assistantText,
            });
          } catch (persistError) {
            console.error("[api/widget/chat] persist assistant", persistError);
          }

          controller.enqueue(encodeSse({ type: "done", conversationId }));
          controller.close();
        } catch (error) {
          console.error("[api/widget/chat] stream", error);
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
        ...widgetCorsHeaders(),
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[api/widget/chat] POST", error);
    return jsonError(
      "Something went wrong while chatting. Please try again.",
      500,
    );
  }
}
