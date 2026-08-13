import type { SupabaseClient } from "@supabase/supabase-js";
import { embedTexts, formatEmbeddingForDb } from "@/lib/gemini";
import type { Database } from "@/lib/supabase/database.types";

const MATCH_COUNT = 8;
const SIMILARITY_FLOOR = 0.25;

export type RetrievedChunk = {
  id: string;
  content: string;
  similarity: number;
};

type AppSupabase = SupabaseClient<Database>;

/**
 * Embed the question and return top-k chunks for this bot above the
 * similarity floor. Empty array means "I don't know from your docs."
 */
export async function retrieveChunks(
  supabase: AppSupabase,
  botId: string,
  query: string,
): Promise<RetrievedChunk[]> {
  const [embedding] = await embedTexts([query], {
    taskType: "RETRIEVAL_QUERY",
  });

  if (!embedding) {
    throw new Error("Query embedding was empty.");
  }

  const { data, error } = await supabase.rpc("match_chunks", {
    p_bot_id: botId,
    p_query_embedding: formatEmbeddingForDb(embedding),
    p_match_count: MATCH_COUNT,
  });

  if (error) {
    console.error("[lib/rag/retrieve] match_chunks", error);
    throw new Error("Could not search knowledge for this bot.");
  }

  return (data ?? []).filter(
    (row) => row.content.trim().length > 0 && row.similarity >= SIMILARITY_FLOOR,
  );
}
