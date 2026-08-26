import { describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "../../tests/helpers/fake-supabase";

const geminiMocks = vi.hoisted(() => ({
  embedTexts: vi.fn(),
}));

vi.mock("@/lib/gemini", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gemini")>()),
  embedTexts: geminiMocks.embedTexts,
}));

import { retrieveChunks } from "@/lib/rag/retrieve";

const EMBEDDING = [0.1, 0.2, 0.3];

describe("retrieveChunks", () => {
  it("embeds the query then calls match_chunks with a formatted vector", async () => {
    geminiMocks.embedTexts.mockResolvedValueOnce([EMBEDDING]);
    const supabase = createFakeSupabase({
      rpc: {
        match_chunks: {
          data: [{ id: "c1", content: "chunk", similarity: 0.9 }],
        },
      },
    });

    const result = await retrieveChunks(supabase, "bot-1", "what?");

    expect(geminiMocks.embedTexts).toHaveBeenCalledWith(["what?"], {
      taskType: "RETRIEVAL_QUERY",
    });
    expect(supabase.calls.rpc[0]).toEqual({
      name: "match_chunks",
      args: {
        p_bot_id: "bot-1",
        p_query_embedding: "[0.1,0.2,0.3]",
        p_match_count: 8,
      },
    });
    expect(result).toEqual([{ id: "c1", content: "chunk", similarity: 0.9 }]);
  });

  it("filters empty content and low-similarity rows", async () => {
    geminiMocks.embedTexts.mockResolvedValueOnce([EMBEDDING]);
    const supabase = createFakeSupabase({
      rpc: {
        match_chunks: {
          data: [
            { id: "keep", content: "solid", similarity: 0.5 },
            { id: "weak", content: "weak", similarity: 0.24 },
            { id: "floor-ok", content: "at floor", similarity: 0.25 },
            { id: "blank", content: "   ", similarity: 0.99 },
          ],
        },
      },
    });

    const result = await retrieveChunks(supabase, "bot-1", "q");
    expect(result.map((row) => row.id)).toEqual(["keep", "floor-ok"]);
  });

  it("returns [] when the RPC returns null data", async () => {
    geminiMocks.embedTexts.mockResolvedValueOnce([EMBEDDING]);
    const supabase = createFakeSupabase({});
    await expect(retrieveChunks(supabase, "bot-1", "q")).resolves.toEqual([]);
  });

  it("throws a friendly error when the RPC fails", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      geminiMocks.embedTexts.mockResolvedValueOnce([EMBEDDING]);
      const supabase = createFakeSupabase({
        rpc: { match_chunks: { error: { message: "boom" } } },
      });
      await expect(retrieveChunks(supabase, "bot-1", "q")).rejects.toThrow(
        "Could not search knowledge for this bot.",
      );
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("throws when the query embedding is empty", async () => {
    geminiMocks.embedTexts.mockResolvedValueOnce([]);
    const supabase = createFakeSupabase();
    await expect(retrieveChunks(supabase, "bot-1", "q")).rejects.toThrow(
      "Query embedding was empty.",
    );
    expect(supabase.calls.rpc).toHaveLength(0);
  });
});
