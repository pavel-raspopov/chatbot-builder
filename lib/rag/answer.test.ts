import { describe, expect, it, vi } from "vitest";

const geminiMocks = vi.hoisted(() => ({
  streamChatCompletion: vi.fn(),
}));

vi.mock("@/lib/gemini", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gemini")>()),
  streamChatCompletion: geminiMocks.streamChatCompletion,
}));

import {
  buildSystemInstruction,
  streamGroundedAnswer,
  UNKNOWN_FROM_DOCS,
} from "@/lib/rag/answer";
import type { RetrievedChunk } from "@/lib/rag/retrieve";

function chunk(content: string): RetrievedChunk {
  return { id: content, content, similarity: 0.9 };
}

describe("buildSystemInstruction", () => {
  it("always includes grounding rules and numbered excerpts", () => {
    const result = buildSystemInstruction("  ", [chunk("alpha"), chunk("beta")]);
    expect(result).toContain("Answer only from the knowledge excerpts");
    expect(result).toContain("[1]\nalpha");
    expect(result).toContain("[2]\nbeta");
    expect(result).not.toContain("Bot instructions:");
  });

  it("includes trimmed custom bot instructions when present", () => {
    const result = buildSystemInstruction("  Be terse.  ", [chunk("alpha")]);
    expect(result).toContain("Bot instructions:\nBe terse.");
    // Custom prompt comes after rules, before excerpts.
    const rulesAt = result.indexOf("Answer only");
    const customAt = result.indexOf("Be terse.");
    const excerptsAt = result.indexOf("Knowledge excerpts:");
    expect(rulesAt).toBeLessThan(customAt);
    expect(customAt).toBeLessThan(excerptsAt);
  });
});

describe("streamGroundedAnswer", () => {
  it("streams deltas from the chat completion", async () => {
    geminiMocks.streamChatCompletion.mockImplementationOnce(
      async function* () {
        yield "one ";
        yield "two";
      },
    );

    const deltas: string[] = [];
    for await (const delta of streamGroundedAnswer({
      botSystemPrompt: "",
      chunks: [chunk("alpha")],
      userMessage: "q",
    })) {
      deltas.push(delta);
    }

    expect(deltas).toEqual(["one ", "two"]);
    const [call] = geminiMocks.streamChatCompletion.mock.calls[0]!;
    expect(call.userMessage).toBe("q");
    expect(call.systemInstruction).toContain("[1]\nalpha");
  });

  it("exports a fallback message for empty retrieval", () => {
    expect(UNKNOWN_FROM_DOCS).toMatch(/don't know from your docs/i);
  });
});
