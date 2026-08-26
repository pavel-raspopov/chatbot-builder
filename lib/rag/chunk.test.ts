import { describe, expect, it } from "vitest";
import { chunkText, estimateTokenCount } from "@/lib/rag/chunk";

describe("estimateTokenCount", () => {
  it("returns 0 for empty text", () => {
    expect(estimateTokenCount("")).toBe(0);
  });

  it("floors at 1 for short text", () => {
    expect(estimateTokenCount("hi")).toBe(1);
  });

  it("approximates chars / 4 rounded up", () => {
    expect(estimateTokenCount("a".repeat(9))).toBe(3);
  });
});

describe("chunkText", () => {
  it("returns [] for empty or whitespace-only input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\t  ")).toEqual([]);
  });

  it("normalizes CRLF line endings", () => {
    const [chunk] = chunkText("line one\r\nline two");
    expect(chunk?.content).toBe("line one\nline two");
  });

  it("returns a single chunk for text within the limit", () => {
    const text = "a".repeat(600);
    const chunks = chunkText(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.content).toBe(text);
  });

  it("produces multiple chunks with overlap for long text", () => {
    const text = "word ".repeat(400).trim(); // ~2000 chars, spaces only
    const chunks = chunkText(text, { chunkChars: 200, overlapChars: 40 });

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(200);
      expect(chunk.tokenCount).toBeGreaterThan(0);
    }
    // Consecutive chunks share overlapping content.
    const headOfSecond = chunks[1]!.content.slice(0, 20);
    expect(chunks[0]!.content.includes(headOfSecond)).toBe(true);
  });

  it("prefers paragraph breaks over hard cuts", () => {
    const halfA = "a".repeat(120);
    const halfB = "b".repeat(120);
    const text = `${halfA}\n\n${halfB}`;
    const chunks = chunkText(text, { chunkChars: 150, overlapChars: 10 });
    expect(chunks[0]!.content).toBe(halfA);
  });

  it("prefers sentence breaks over mid-word cuts", () => {
    const sentence = `${"x".repeat(100)}. `;
    const tail = "y".repeat(80);
    const text = `${sentence}${tail}`;
    const chunks = chunkText(text, { chunkChars: 130, overlapChars: 10 });
    expect(chunks[0]!.content.endsWith(".")).toBe(true);
  });

  it("never loops forever on pathological input", () => {
    const chunks = chunkText("a".repeat(5000), {
      chunkChars: 5,
      overlapChars: 4,
    });
    expect(chunks.length).toBeGreaterThan(0);
  });
});
