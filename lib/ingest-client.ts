export type IngestApiResult =
  | { success: true; chunkCount?: number }
  | { success: false; error: string };

/**
 * Trigger document ingest via POST /api/ingest (cookie session).
 */
export async function requestDocumentIngest(
  documentId: string,
): Promise<IngestApiResult> {
  try {
    const response = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });

    let payload: { success?: boolean; error?: string; chunkCount?: number } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      // Non-JSON error body
    }

    if (!response.ok || !payload.success) {
      return {
        success: false,
        error:
          typeof payload.error === "string" && payload.error
            ? payload.error
            : "Indexing failed. Please try again.",
      };
    }

    return { success: true, chunkCount: payload.chunkCount };
  } catch (error) {
    console.error("[lib/ingest-client] requestDocumentIngest", error);
    return {
      success: false,
      error: "Could not reach the indexing service. Please try again.",
    };
  }
}
