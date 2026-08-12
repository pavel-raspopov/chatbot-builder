import type { SupabaseClient } from "@supabase/supabase-js";
import { embedTexts, formatEmbeddingForDb } from "@/lib/gemini";
import { chunkText } from "@/lib/rag/chunk";
import { ExtractError, extractDocumentText } from "@/lib/rag/extract";
import type { Database } from "@/lib/supabase/database.types";

export type IngestResult =
  | { success: true; chunkCount: number }
  | { success: false; error: string; statusCode: number };

type AppSupabase = SupabaseClient<Database>;

const USER_FACING_GENERIC =
  "Indexing failed. Please try again, or delete and re-upload the file.";

function toUserFacingError(error: unknown): string {
  if (error instanceof ExtractError) {
    return error.message;
  }
  if (error instanceof Error) {
    if (error.message.includes("GEMINI_API_KEY")) {
      return "AI indexing is not configured. Please contact support.";
    }
    if (/quota|rate|429/i.test(error.message)) {
      return "Indexing is temporarily busy. Please try again in a moment.";
    }
  }
  return USER_FACING_GENERIC;
}

async function setDocumentStatus(
  supabase: AppSupabase,
  documentId: string,
  status: "processing" | "ready" | "failed",
  error: string | null = null,
): Promise<void> {
  const { error: updateError } = await supabase
    .from("documents")
    .update({ status, error })
    .eq("id", documentId);

  if (updateError) {
    console.error("[lib/rag/ingest] setDocumentStatus", updateError);
    throw new Error("Could not update document status.");
  }
}

/**
 * Run the full ingest pipeline for a document owned by `userId`.
 * Idempotent: deletes prior chunks before inserting new ones (supports Retry).
 */
export async function ingestDocument(
  supabase: AppSupabase,
  documentId: string,
  userId: string,
): Promise<IngestResult> {
  if (!documentId) {
    return { success: false, error: "Missing document id.", statusCode: 400 };
  }

  const { data: document, error: loadError } = await supabase
    .from("documents")
    .select(
      "id, bot_id, user_id, filename, storage_path, mime_type, status",
    )
    .eq("id", documentId)
    .maybeSingle();

  if (loadError) {
    console.error("[lib/rag/ingest] load", loadError);
    return {
      success: false,
      error: "Could not load document. Please try again.",
      statusCode: 500,
    };
  }

  if (!document) {
    return { success: false, error: "Document not found.", statusCode: 404 };
  }

  if (document.user_id !== userId) {
    return { success: false, error: "Document not found.", statusCode: 404 };
  }

  try {
    await setDocumentStatus(supabase, documentId, "processing", null);

    const { data: blob, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.storage_path);

    if (downloadError || !blob) {
      console.error("[lib/rag/ingest] download", downloadError);
      throw new ExtractError(
        "Could not download the uploaded file. Try deleting and uploading again.",
      );
    }

    const buffer = new Uint8Array(await blob.arrayBuffer());
    const text = await extractDocumentText(buffer, document.mime_type);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      throw new ExtractError("No extractable text in this file.");
    }

    const embeddings = await embedTexts(
      chunks.map((chunk) => chunk.content),
      { taskType: "RETRIEVAL_DOCUMENT" },
    );

    const { error: deleteError } = await supabase
      .from("chunks")
      .delete()
      .eq("document_id", documentId);

    if (deleteError) {
      console.error("[lib/rag/ingest] delete chunks", deleteError);
      throw new Error("Could not clear previous index data.");
    }

    const rows = chunks.map((chunk, index) => ({
      document_id: documentId,
      bot_id: document.bot_id,
      content: chunk.content,
      embedding: formatEmbeddingForDb(embeddings[index]!),
      token_count: chunk.tokenCount,
    }));

    const { error: insertError } = await supabase.from("chunks").insert(rows);

    if (insertError) {
      console.error("[lib/rag/ingest] insert chunks", insertError);
      throw new Error("Could not save indexed chunks.");
    }

    await setDocumentStatus(supabase, documentId, "ready", null);

    return { success: true, chunkCount: rows.length };
  } catch (error) {
    console.error("[lib/rag/ingest] failed", documentId, error);
    const message = toUserFacingError(error);
    try {
      await setDocumentStatus(supabase, documentId, "failed", message);
    } catch (statusError) {
      console.error("[lib/rag/ingest] failed status write", statusError);
    }
    return { success: false, error: message, statusCode: 500 };
  }
}
