import { GoogleGenAI } from "@google/genai";

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

const EMBED_BATCH_SIZE = 20;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return key;
}

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return client;
}

/**
 * Embed texts with Gemini at 768 dimensions (matches chunks.embedding vector(768)).
 * Returns one float array per input, in order.
 */
export async function embedTexts(
  texts: string[],
  options?: { taskType?: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" },
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const ai = getGeminiClient();
  const taskType = options?.taskType ?? "RETRIEVAL_DOCUMENT";
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
      config: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType,
      },
    });

    const embeddings = response.embeddings ?? [];
    if (embeddings.length !== batch.length) {
      throw new Error(
        `Embedding count mismatch: expected ${batch.length}, got ${embeddings.length}.`,
      );
    }

    for (const embedding of embeddings) {
      const values = embedding.values;
      if (!values || values.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Invalid embedding length: expected ${EMBEDDING_DIMENSIONS}, got ${values?.length ?? 0}.`,
        );
      }
      results.push(values);
    }
  }

  return results;
}

/** Format a float vector for pgvector / PostgREST. */
export function formatEmbeddingForDb(values: number[]): string {
  return `[${values.join(",")}]`;
}
