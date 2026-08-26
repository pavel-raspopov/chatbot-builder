import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";
import type { FakeSupabaseConfig } from "@/tests/helpers/fake-supabase";

const mocks = vi.hoisted(() => ({
  supabase: {
    current: null as unknown,
  },
  retrieveChunks: vi.fn(),
  streamGroundedAnswer: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mocks.supabase.current),
}));

vi.mock("@/lib/rag/retrieve", () => ({
  retrieveChunks: mocks.retrieveChunks,
}));

vi.mock("@/lib/rag/answer", () => ({
  UNKNOWN_FROM_DOCS: "I don't know from docs.",
  streamGroundedAnswer: mocks.streamGroundedAnswer,
}));

import { POST } from "@/app/api/chat/route";

const UNKNOWN_FROM_DOCS = "I don't know from docs.";

function useSupabase(config: FakeSupabaseConfig = {}) {
  const client = createFakeSupabase(config);
  mocks.supabase.current = client;
  return client;
}

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function rawRequest(body: string): Request {
  return new Request("http://localhost/api/chat", { method: "POST", body });
}

const OK_BOT = {
  auth: { user: { id: "user-1" } },
  tables: {
    bots: { select: { data: { id: "bot-1", system_prompt: "be helpful" } } },
    profiles: { select: { data: { plan: "pro" } } },
    conversations: { insert: { data: { id: "conv-new" } } },
  },
  rpc: {
    consume_message_quota: {
      data: [{ allowed: true, used: 3, month_limit: 2000 }],
    },
  },
};

function mockStream(...deltas: string[]) {
  mocks.streamGroundedAnswer.mockImplementation(() =>
    (async function* generate() {
      for (const delta of deltas) {
        yield delta;
      }
    })(),
  );
}

async function readSse(response: Response): Promise<
  Array<Record<string, unknown>>
> {
  const text = await response.text();
  return text
    .split("\n\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => JSON.parse(line.slice(6)) as Record<string, unknown>);
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.retrieveChunks.mockReset().mockResolvedValue([
    { id: "c1", content: "Doc text", similarity: 0.9 },
  ]);
  mocks.streamGroundedAnswer.mockReset();
  useSupabase(OK_BOT);
});

describe("POST /api/chat validation", () => {
  it("rejects an invalid JSON body with 400", async () => {
    const response = await POST(rawRequest("not json"));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ success: false });
  });

  it("requires a bot id", async () => {
    const response = await POST(postRequest({ message: "hi" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/missing bot id/i);
  });

  it("requires a non-empty message", async () => {
    const response = await POST(postRequest({ botId: "bot-1", message: "" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/message is required/i);
  });

  it("rejects messages over 4000 characters", async () => {
    const response = await POST(
      postRequest({ botId: "bot-1", message: "x".repeat(4001) }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/too long/i);
  });

  it("returns 401 when there is no session", async () => {
    useSupabase({ auth: { user: null } });
    const response = await POST(
      postRequest({ botId: "bot-1", message: "hi" }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 404 when the bot is not owned by the caller", async () => {
    useSupabase({
      ...OK_BOT,
      tables: { ...OK_BOT.tables, bots: { select: { data: null } } },
    });
    const response = await POST(
      postRequest({ botId: "ghost", message: "hi" }),
    );
    expect(response.status).toBe(404);
    expect((await response.json()).error).toMatch(/bot not found/i);
  });
});


describe("POST /api/chat streaming", () => {
  it("maps retrieval failures to a 500", async () => {
    mocks.retrieveChunks.mockRejectedValueOnce(new Error("embed failed"));

    const response = await POST(
      postRequest({ botId: "bot-1", message: "hi" }),
    );
    expect(response.status).toBe(500);
    expect((await response.json()).error).toMatch(/could not search/i);
  });

  it("propagates quota exhaustion as 429", async () => {
    useSupabase({
      ...OK_BOT,
      rpc: {
        consume_message_quota: {
          data: [{ allowed: false, used: 2000, month_limit: 2000 }],
        },
      },
    });

    const response = await POST(
      postRequest({ botId: "bot-1", message: "hi" }),
    );
    expect(response.status).toBe(429);
    expect((await response.json()).error).toMatch(/monthly message limit/i);
    expect(mocks.retrieveChunks).toHaveBeenCalled();
  });

  it("streams deltas then done and persists both turns", async () => {
    mockStream("Hello ", "world");

    const response = await POST(
      postRequest({ botId: "bot-1", message: "hi there" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(
      "text/event-stream",
    );

    const events = await readSse(response);
    expect(events).toEqual([
      { type: "delta", text: "Hello " },
      { type: "delta", text: "world" },
      { type: "done", conversationId: "conv-new" },
    ]);

    const supabase = mocks.supabase.current as ReturnType<
      typeof createFakeSupabase
    >;
    const messageInserts = supabase.calls.insertedRows.filter(
      (row) => row.table === "messages",
    );
    expect(messageInserts).toEqual([
      {
        table: "messages",
        rows: {
          conversation_id: "conv-new",
          role: "user",
          content: "hi there",
        },
      },
      {
        table: "messages",
        rows: {
          conversation_id: "conv-new",
          role: "assistant",
          content: "Hello world",
        },
      },
    ]);
    expect(supabase.calls.rpc[0]?.name).toBe("consume_message_quota");
  });

  it("answers with UNKNOWN_FROM_DOCS when nothing was retrieved", async () => {
    mocks.retrieveChunks.mockResolvedValueOnce([]);

    const response = await POST(
      postRequest({ botId: "bot-1", message: "hi" }),
    );

    const events = await readSse(response);
    expect(events).toEqual([
      { type: "delta", text: UNKNOWN_FROM_DOCS },
      { type: "done", conversationId: "conv-new" },
    ]);
    expect(mocks.streamGroundedAnswer).not.toHaveBeenCalled();
  });
});
