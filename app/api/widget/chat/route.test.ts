import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";
import type { FakeSupabaseConfig } from "@/tests/helpers/fake-supabase";

const mocks = vi.hoisted(() => ({
  adminClient: {
    current: null as ReturnType<typeof createFakeSupabase> | null,
    throwServiceRoleMissing: false,
  },
  retrieveChunks: vi.fn(),
  streamGroundedAnswer: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => {
    if (mocks.adminClient.throwServiceRoleMissing) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is required for the admin client.",
      );
    }
    return mocks.adminClient.current;
  },
}));

vi.mock("@/lib/rag/retrieve", () => ({
  retrieveChunks: mocks.retrieveChunks,
}));

vi.mock("@/lib/rag/answer", () => ({
  UNKNOWN_FROM_DOCS: "I don't know from docs.",
  streamGroundedAnswer: mocks.streamGroundedAnswer,
}));

import { OPTIONS, POST } from "@/app/api/widget/chat/route";

const UNKNOWN_FROM_DOCS = "I don't know from docs.";

function useAdmin(config: FakeSupabaseConfig = {}) {
  const client = createFakeSupabase(config);
  mocks.adminClient.current = client;
  mocks.adminClient.throwServiceRoleMissing = false;
  return client;
}

const OK_BOT_BASE = {
  tables: {
    bots: {
      select: {
        data: { id: "bot-1", user_id: "owner-1", system_prompt: "be kind" },
      },
    },
    profiles: { select: { data: { plan: "free" } } },
    conversations: { insert: { data: { id: "wconv-new" } } },
  },
  rpc: {
    consume_owner_message_quota: {
      data: [{ allowed: true, used: 3, month_limit: 50 }],
    },
  },
};

function postRequest(
  body: unknown,
  ip: string,
): Request {
  return new Request("http://localhost/api/widget/chat", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "x-forwarded-for": ip },
  });
}

function rawRequest(body: string, ip: string): Request {
  return new Request("http://localhost/api/widget/chat", {
    method: "POST",
    body,
    headers: { "x-forwarded-for": ip },
  });
}

function mockStream(...deltas: string[]) {
  mocks.streamGroundedAnswer.mockImplementation(() =>
    (async function* generate() {
      for (const delta of deltas) {
        yield delta;
      }
    })(),
  );
}

async function readSse(
  response: Response,
): Promise<Array<Record<string, unknown>>> {
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
  useAdmin(OK_BOT_BASE);
});

describe("OPTIONS /api/widget/chat", () => {
  it("answers preflights with 204 and CORS headers", async () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBeDefined();
    expect(response.headers.get("access-control-allow-methods")).toContain(
      "POST",
    );
  });
});

describe("POST /api/widget/chat validation", () => {
  it.each([
    ["invalid JSON", "not json", 400, /invalid json/i],
    [
      "missing public id",
      { conversationId: null, message: "hi" },
      400,
      /missing bot id/i,
    ],
    [
      "missing message",
      { publicId: "pub-1", message: "" },
      400,
      /message is required/i,
    ],
  ])("rejects %s with 400", (_name, body, expectedStatus) => {
    void _name;
    const request =
      typeof body === "string"
        ? rawRequest(body, "10.9.0.1")
        : postRequest(body, "10.9.0.1");
    return expect(POST(request)).resolves.toMatchObject({
      status: expectedStatus,
    });
  });
});

describe("POST /api/widget/chat configuration and lookup", () => {
  it("returns a configuration error when the service role key is missing", async () => {
    mocks.adminClient.throwServiceRoleMissing = true;

    const response = await POST(
      postRequest({ publicId: "pub-cfg", message: "hi" }, "[IP_ADDRESS]"),
    );
    expect(response.status).toBe(500);
    expect((await response.json()).error).toMatch(
      /SUPABASE_SERVICE_ROLE_KEY/i,
    );
  });

  it("returns 404 when no bot matches the public id", async () => {
    useAdmin({
      tables: { ...OK_BOT_BASE.tables, bots: { select: { data: null } } },
    });

    const response = await POST(
      postRequest({ publicId: "ghost", message: "hi" }, "[IP_ADDRESS]"),
    );
    expect(response.status).toBe(404);
    expect((await response.json()).error).toMatch(/bot not found/i);
  });

  it("maps owner-profile load failures to a 500", async () => {
    useAdmin({
      tables: {
        ...OK_BOT_BASE.tables,
        profiles: { select: { error: { message: "down" } } },
      },
    });

    const response = await POST(
      postRequest({ publicId: "pub-1", message: "hi" }, "[IP_ADDRESS]"),
    );
    expect(response.status).toBe(500);
  });
});

describe("POST /api/widget/chat rate limiting", () => {
  it("denies the 21st request per minute for free-plan owners", async () => {
    useAdmin({
      tables: { ...OK_BOT_BASE.tables, bots: { select: { data: null } } },
    });

    for (let i = 1; i <= 20; i += 1) {
      const response = await POST(
        postRequest({ publicId: "pub-free", message: "hi" }, "[IP_ADDRESS]"),
      );
      expect(response.status).not.toBe(429);
    }

    const denied = await POST(
      postRequest({ publicId: "pub-free", message: "hi" }, "[IP_ADDRESS]"),
    );
    expect(denied.status).toBe(429);

    // A different key (publicId) is unaffected by the exhausted bucket.
    const otherKey = await POST(
      postRequest({ publicId: "pub-other", message: "hi" }, "[IP_ADDRESS]"),
    );
    expect(otherKey.status).not.toBe(429);
  });

  it("raises the ceiling for business-plan owners", async () => {
    useAdmin({
      ...OK_BOT_BASE,
      tables: {
        ...OK_BOT_BASE.tables,
        profiles: { select: { data: { plan: "business" } } },
      },
    });
    mockStream("ok");

    for (let i = 1; i <= 20; i += 1) {
      const response = await POST(
        postRequest({ publicId: "pub-biz", message: "hi" }, "[IP_ADDRESS]"),
      );
      expect(response.status).toBe(200);
      const events = await readSse(response);
      expect(events.at(-1)).toMatchObject({ type: "done" });
    }
  });
});

describe("POST /api/widget/chat streaming success", () => {
  it("streams deltas then done over CORS-enabled SSE and persists both turns", async () => {
    mockStream("Hello ", "widget");
    const admin = mocks.adminClient.current;
    if (!admin) {
      throw new Error("admin client missing");
    }

    const response = await POST(
      postRequest({ publicId: "pub-ok", message: "hello?" }, "[IP_ADDRESS]"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeDefined();
    expect(response.headers.get("content-type")).toContain(
      "text/event-stream",
    );

    const events = await readSse(response);
    expect(events).toEqual([
      { type: "delta", text: "Hello " },
      { type: "delta", text: "widget" },
      { type: "done", conversationId: "wconv-new" },
    ]);

    const conversationInserts = admin.calls.insertedRows.find(
      (row) => row.table === "conversations",
    );
    expect(conversationInserts?.rows).toEqual({
      bot_id: "bot-1",
      user_id: null,
      source: "widget",
    });
    const roles = admin.calls.insertedRows
      .filter((row) => row.table === "messages")
      .map((row) => (row.rows as { role: string }).role);
    expect(roles).toEqual(["user", "assistant"]);
    expect(admin.calls.rpc[0]?.name).toBe("consume_owner_message_quota");
  });

  it("falls back to UNKNOWN_FROM_DOCS when retrieval is empty", async () => {
    mocks.retrieveChunks.mockResolvedValueOnce([]);
    mockStream("should-not-run");

    const response = await POST(
      postRequest({ publicId: "pub-empty", message: "hello?" }, "[IP_ADDRESS]"),
    );

    const events = await readSse(response);
    expect(events).toEqual([
      { type: "delta", text: UNKNOWN_FROM_DOCS },
      { type: "done", conversationId: "wconv-new" },
    ]);
    expect(mocks.streamGroundedAnswer).not.toHaveBeenCalled();
  });
});

