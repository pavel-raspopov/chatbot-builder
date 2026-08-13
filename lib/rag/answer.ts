import { streamChatCompletion } from "@/lib/gemini";
import type { RetrievedChunk } from "@/lib/rag/retrieve";

export const UNKNOWN_FROM_DOCS =
  "I don't know from your docs. Try asking about something in the files you uploaded, or add a document that covers this.";

const GROUNDING_RULES = `You are a product-docs assistant. Answer only from the knowledge excerpts provided.
If the excerpts do not contain the answer, say you don't know from the uploaded docs. Do not invent procedures, prices, or APIs.
Be concise and practical.`;

export function buildSystemInstruction(
  botSystemPrompt: string,
  chunks: RetrievedChunk[],
): string {
  const custom = botSystemPrompt.trim();
  const excerpts = chunks
    .map((chunk, index) => `[${index + 1}]\n${chunk.content}`)
    .join("\n\n");

  const parts = [GROUNDING_RULES];
  if (custom) {
    parts.push(`Bot instructions:\n${custom}`);
  }
  parts.push(`Knowledge excerpts:\n${excerpts}`);
  return parts.join("\n\n");
}

/**
 * Stream a grounded reply. Callers must short-circuit empty retrieval
 * with UNKNOWN_FROM_DOCS instead of calling this.
 */
export async function* streamGroundedAnswer(params: {
  botSystemPrompt: string;
  chunks: RetrievedChunk[];
  userMessage: string;
}): AsyncGenerator<string> {
  const systemInstruction = buildSystemInstruction(
    params.botSystemPrompt,
    params.chunks,
  );

  for await (const delta of streamChatCompletion({
    systemInstruction,
    userMessage: params.userMessage,
  })) {
    yield delta;
  }
}
