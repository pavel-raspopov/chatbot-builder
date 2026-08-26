import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";
import type { FakeSupabaseConfig } from "@/tests/helpers/fake-supabase";
import { ExtractError } from "@/lib/rag/extract";

const mocks = vi.hoisted(() => ({
  embedTexts: vi.fn(),
  extractDocumentText: vi.fn(),
}));

vi.mock("@/lib/gemini", () => ({
  embedTexts: mocks.embedTexts,
  formatEmbeddingForDb: (embedding: number[]) => `[${embedding.join(",")}]`,
}));

vi.mock("@/lib/rag/extract", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/rag/extract")>();
  return {
    ...original,
    ExtractError: original.ExtractError,
    extractDocumentText: mocks.extractDocumentText,
  };
});

import { ingestDocument } from "@/lib/rag/ingest";
import { chunkText } from "@/lib/rag/chunk";

const LONG_TEXT =
  `${"first chunk of text. ".repeat(40)}\n\n${"second chunk of text! ".repeat(40)}`;

const DOC_ROW = {
  id: "doc-1",
  bot_id: "bot-1",
  user_id: "user-1",
  filename: "handbook.pdf",
  storage_path: "user-1/bot-1/handbook.pdf",
  mime_type: "application/pdf",
  status: "pending",
};

function useSupabase(
  overrides: Partial<FakeSupabaseConfig["tables"]> = {},
): ReturnType<typeof createFakeSupabase> {
  return createFakeSupabase({
    tables: {
      documents: {
        select: { data: { ...DOC_ROW } },
        update: { data: null },
        ...overrides.documents,
      },
      chunks: {
        delete: { data: null },
        insert: { data: null },
        ...overrides.chunks,
      },
      ...overrides,
    },
    storage: {
      download: {
        data: new Blob([new TextEncoder().encode("hello world")]),
      },
    },
  });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.embedTexts.mockReset().mockImplementation(
    (texts: string[]) =>
      Promise.resolve(texts.map(() => [0.1, 0.2])),
  );
  mocks.extractDocumentText.mockReset().mockResolvedValue(LONG_TEXT);
});

describe("ingestDocument guards", () => {
  it("rejects an empty document id", async () => {
    const supabase = useSupabase();
    const result = await ingestDocument(supabase, "", "user-1");
    expect(result).toEqual({
      success: false,
      error: "Missing document id.",
      statusCode: 400,
    });
  });

  it("maps load errors to a 500 and missing rows to a 404", async () => {
    const failed = await ingestDocument(
      useSupabase({ documents: { select: { error: { message: "down" } } } }),
      "doc-1",
      "user-1",
    );
    expect(failed).toMatchObject({ success: false, statusCode: 500 });

    const missing = await ingestDocument(
      useSupabase({ documents: { select: { data: null } } }),
      "ghost",
      "user-1",
    );
    expect(missing).toMatchObject({
      success: false,
      error: "Document not found.",
      statusCode: 404,
    });
  });

  it("hides documents owned by other users behind a 404", async () => {
    const supabase = useSupabase();
    const result = await ingestDocument(supabase, "doc-1", "intruder");
    expect(result).toMatchObject({ success: false, statusCode: 404 });
  });

  it("refuses to reindex files that are already processing without force", async () => {
    const supabase = useSupabase({
      documents: { select: { data: { ...DOC_ROW, status: "processing" } } },
    });

    const busy = await ingestDocument(supabase, "doc-1", "user-1");
    expect(busy).toMatchObject({
      success: false,
      statusCode: 409,
      error: expect.stringMatching(/already indexing/i),
    });

    // force bypasses the guard
    const forced = await ingestDocument(supabase, "doc-1", "user-1", {
      force: true,
    });
    expect(forced.success).toBe(true);
  });
});

describe("ingestDocument pipeline", () => {
  it("marks processing, replaces chunks, then marks ready", async () => {
    const supabase = useSupabase();

    const result = await ingestDocument(supabase, "doc-1", "user-1");
    const expectedChunks = chunkText(LONG_TEXT);
    expect(expectedChunks.length).toBeGreaterThan(1);

    expect(result).toEqual({ success: true, chunkCount: expectedChunks.length });
    expect(mocks.extractDocumentText).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      "application/pdf",
    );

    const statuses = supabase.calls.updates
      .filter((row) => row.table === "documents")
      .map((row) => (row.values as { status: string }).status);
    expect(statuses[0]).toBe("processing");
    expect(statuses.at(-1)).toBe("ready");

    const chunkInserts = supabase.calls.insertedRows.filter(
      (row) => row.table === "chunks",
    );
    expect(chunkInserts).toHaveLength(1);
    expect(chunkInserts[0]?.rows).toEqual(
      expectedChunks.map((chunk) => ({
        document_id: "doc-1",
        bot_id: "bot-1",
        content: chunk.content,
        embedding: "[0.1,0.2]",
        token_count: chunk.tokenCount,
      })),
    );
  });

  it("writes the friendly failure status when extraction fails", async () => {
    mocks.extractDocumentText.mockRejectedValueOnce(
      new ExtractError("Unsupported file type."),
    );
    const supabase = useSupabase();

    const result = await ingestDocument(supabase, "doc-1", "user-1");

    expect(result).toEqual({
      success: false,
      error: "Unsupported file type.",
      statusCode: 500,
    });
    const failureUpdate = supabase.calls.updates
      .filter((row) => row.table === "documents")
      .at(-1)?.values as { status: string; error: string | null };
    expect(failureUpdate.status).toBe("failed");
    expect(failureUpdate.error).toBe("Unsupported file type.");
  });

  it("translates Gemini configuration problems for end users", async () => {
    mocks.embedTexts.mockRejectedValueOnce(
      new Error("GEMINI_API_KEY is required."),
    );
    const supabase = useSupabase();

    const result = await ingestDocument(supabase, "doc-1", "user-1");
    expect(result).toMatchObject({
      success: false,
      error: "AI indexing is not configured. Please contact support.",
    });
  });

  it("flags rate limits instead of a generic failure", async () => {
    mocks.embedTexts.mockRejectedValueOnce(new Error("429 quota exceeded"));
    const supabase = useSupabase();

    const result = await ingestDocument(supabase, "doc-1", "user-1");
    expect(result).toMatchObject({
      success: false,
      error: expect.stringMatching(/temporarily busy/i),
    });
  });

  it("keeps the generic message when the failure status write also fails", async () => {
    mocks.extractDocumentText.mockRejectedValueOnce(
      new Error("mysterious explosion"),
    );
    const supabase = useSupabase({
      documents: {
        select: { data: { ...DOC_ROW } },
        update: { error: { message: "storage down" } },
      },
    });

    const result = await ingestDocument(supabase, "doc-1", "user-1");
    expect(result).toEqual({
      success: false,
      error:
        "Indexing failed. Please try again, or delete and re-upload the file.",
      statusCode: 500,
    });
  });
});

