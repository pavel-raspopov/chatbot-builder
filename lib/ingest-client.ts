export type IngestApiResult =
  | { success: true; chunkCount?: number }
  | { success: false; error: string };

const TIMEOUT_MESSAGE =
  "Indexing may still be running. Refresh, or use Retry if the file stays pending.";

/**
 * Trigger document ingest via POST /api/ingest (cookie session).
 * Pass `force` for an explicit Retry so a stuck `processing` row can run again.
 */
export async function requestDocumentIngest(
  documentId: string,
  options?: { force?: boolean },
): Promise<IngestApiResult> {
  try {
    const response = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId,
        force: options?.force === true,
      }),
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // Non-JSON error body
    }

    const success =
      typeof payload === "object" &&
      payload !== null &&
      "success" in payload &&
      payload.success === true;
    const errorValue =
      typeof payload === "object" && payload !== null && "error" in payload
        ? payload.error
        : undefined;
    const chunkCountValue =
      typeof payload === "object" && payload !== null && "chunkCount" in payload
        ? payload.chunkCount
        : undefined;

    if (!response.ok || !success) {
      return {
        success: false,
        error:
          typeof errorValue === "string" && errorValue
            ? errorValue
            : TIMEOUT_MESSAGE,
      };
    }

    return {
      success: true,
      chunkCount:
        typeof chunkCountValue === "number" ? chunkCountValue : undefined,
    };
  } catch (error) {
    console.error("[lib/ingest-client] requestDocumentIngest", error);
    return {
      success: false,
      error: TIMEOUT_MESSAGE,
    };
  }
}
