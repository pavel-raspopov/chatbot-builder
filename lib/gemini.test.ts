import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  embedContent: vi.fn(),
  generateContentStream: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = {
      embedContent: mocks.embedContent,
      generateContentStream: mocks.generateContentStream,
    };
  },
  ThinkingLevel: { MINIMAL: "minimal" },
}));

import {
  EMBEDDING_DIMENSIONS,
  embedTexts,
  formatEmbeddingForDb,
  streamChatCompletion,
} from "@/lib/gemini";

function embedding(values: number[]) {
  return { values };
}

beforeEach(() => {
  process.env.GEMINI_API_KEY = "test-key";
  mocks.embedContent.mockReset();
  mocks.generateContentStream.mockReset();
});

describe("embedTexts", () => {
  it("returns [] without calling the API for empty input", async () => {
    await expect(embedTexts([])).resolves.toEqual([]);
    expect(mocks.embedContent).not.toHaveBeenCalled();
  });

  it("requests one batch for small inputs and preserves order", async () => {
    const vec = (v: number) => Array<number>(EMBEDDING_DIMENSIONS).fill(v);
    mocks.embedContent.mockResolvedValueOnce({
      embeddings: [embedding(vec(1)), embedding(vec(2))],
    });

    const result = await embedTexts(["a", "b"], {
      taskType: "RETRIEVAL_QUERY",
    });

    expect(result).toEqual([vec(1), vec(2)]);
    expect(mocks.embedContent).toHaveBeenCalledTimes(1);
    const [call] = mocks.embedContent.mock.calls[0]!;
    expect(call.config.taskType).toBe("RETRIEVAL_QUERY");
    expect(call.config.outputDimensionality).toBe(EMBEDDING_DIMENSIONS);
    expect(call.contents).toEqual(["a", "b"]);
  });

  it("splits large inputs into batches of 20 in order", async () => {
    const texts = Array.from({ length: 25 }, (_, i) => `t${i}`);
    const batch1 = texts
      .slice(0, 20)
      .map(() => embedding(Array<number>(EMBEDDING_DIMENSIONS).fill(0.5)));
    const batch2 = texts
      .slice(20)
      .map(() => embedding(Array<number>(EMBEDDING_DIMENSIONS).fill(0.6)));
    mocks.embedContent
      .mockResolvedValueOnce({ embeddings: batch1 })
      .mockResolvedValueOnce({ embeddings: batch2 });

    const result = await embedTexts(texts);

    expect(mocks.embedContent).toHaveBeenCalledTimes(2);
    expect(result[0]![0]).toBe(0.5);
    expect(result[20]![0]).toBe(0.6);
    expect(result).toHaveLength(25);
    result.forEach((v) => expect(v).toHaveLength(EMBEDDING_DIMENSIONS));
  });

  it("throws when the API returns the wrong embedding count", async () => {
    mocks.embedContent.mockResolvedValueOnce({ embeddings: [] });
    await expect(embedTexts(["a"])).rejects.toThrow(/count mismatch/i);
  });

  it("throws when an embedding has the wrong dimensionality", async () => {
    mocks.embedContent.mockResolvedValueOnce({
      embeddings: [embedding([1, 2, 3])],
    });
    await expect(embedTexts(["a"])).rejects.toThrow(
      new RegExp(`expected ${EMBEDDING_DIMENSIONS}`),
    );
  });
});

describe("formatEmbeddingForDb", () => {
  it("formats a pgvector literal", () => {
    expect(formatEmbeddingForDb([0.1, 0.25, -1])).toBe("[0.1,0.25,-1]");
  });
});

describe("streamChatCompletion", () => {
  it("yields only chunks with text", async () => {
    mocks.generateContentStream.mockResolvedValueOnce({
      async *[Symbol.asyncIterator]() {
        yield { text: "Hello" };
        yield { text: undefined };
        yield { text: " world" };
      },
    });

    const deltas: string[] = [];
    for await (const delta of streamChatCompletion({
      systemInstruction: "sys",
      userMessage: "hi",
    })) {
      deltas.push(delta);
    }

    expect(deltas).toEqual(["Hello", " world"]);
    const [call] = mocks.generateContentStream.mock.calls[0]!;
    expect(call.config.systemInstruction).toBe("sys");
    expect(call.contents).toBe("hi");
  });
});
