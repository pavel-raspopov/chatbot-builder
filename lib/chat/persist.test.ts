import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOrCreateAppConversation,
  getOrCreateWidgetConversation,
  insertMessage,
} from "@/lib/chat/persist";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("getOrCreateAppConversation", () => {
  it("returns the existing conversation when the lookup hits", async () => {
    const supabase = createFakeSupabase({
      tables: {
        conversations: { select: { data: { id: "conv-1" } } },
      },
    });

    const id = await getOrCreateAppConversation(supabase, {
      botId: "bot-1",
      userId: "user-1",
      conversationId: "conv-1",
    });

    expect(id).toBe("conv-1");
    expect(supabase.calls.insertedRows).toHaveLength(0);
  });

  it("creates a new app conversation when no id is supplied", async () => {
    const supabase = createFakeSupabase({
      tables: {
        conversations: { insert: { data: { id: "conv-new" } } },
      },
    });

    const id = await getOrCreateAppConversation(supabase, {
      botId: "bot-1",
      userId: "user-1",
      conversationId: null,
    });

    expect(id).toBe("conv-new");
    expect(supabase.calls.insertedRows[0]).toEqual({
      table: "conversations",
      rows: { bot_id: "bot-1", user_id: "user-1", source: "app" },
    });
  });

  it("recreates the conversation when the lookup misses", async () => {
    const supabase = createFakeSupabase({
      tables: {
        conversations: {
          select: { data: null },
          insert: { data: { id: "conv-recreated" } },
        },
      },
    });

    const id = await getOrCreateAppConversation(supabase, {
      botId: "bot-1",
      userId: "user-1",
      conversationId: "conv-stale",
    });

    expect(id).toBe("conv-recreated");
    expect(supabase.calls.insertedRows).toHaveLength(1);
  });

  it("throws a friendly error when loading fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const supabase = createFakeSupabase({
      tables: {
        conversations: { select: { error: { message: "db down" } } },
      },
    });

    await expect(
      getOrCreateAppConversation(supabase, {
        botId: "bot-1",
        userId: "user-1",
        conversationId: "conv-1",
      }),
    ).rejects.toThrow(/could not load this conversation/i);
    expect(consoleError).toHaveBeenCalled();
  });

  it("throws a friendly error when creating fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase({
      tables: {
        conversations: { insert: { error: { message: "rls" } } },
      },
    });

    await expect(
      getOrCreateAppConversation(supabase, {
        botId: "bot-1",
        userId: "user-1",
        conversationId: null,
      }),
    ).rejects.toThrow(/could not start this conversation/i);
  });
});

describe("getOrCreateWidgetConversation", () => {
  it("returns the existing widget conversation when found", async () => {
    const supabase = createFakeSupabase({
      tables: {
        conversations: { select: { data: { id: "wconv-1" } } },
      },
    });

    const id = await getOrCreateWidgetConversation(supabase, {
      botId: "bot-1",
      conversationId: "wconv-1",
    });

    expect(id).toBe("wconv-1");
    expect(supabase.calls.insertedRows).toHaveLength(0);
  });

  it("creates anonymous widget conversations without a user", async () => {
    const supabase = createFakeSupabase({
      tables: {
        conversations: { insert: { data: { id: "wconv-new" } } },
      },
    });

    const id = await getOrCreateWidgetConversation(supabase, {
      botId: "bot-1",
      conversationId: null,
    });

    expect(id).toBe("wconv-new");
    expect(supabase.calls.insertedRows[0]).toEqual({
      table: "conversations",
      rows: { bot_id: "bot-1", user_id: null, source: "widget" },
    });
  });

  it("surfaces load failures as a load error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase({
      tables: {
        conversations: { select: { error: { message: "boom" } } },
      },
    });

    await expect(
      getOrCreateWidgetConversation(supabase, {
        botId: "bot-1",
        conversationId: "wconv-1",
      }),
    ).rejects.toThrow(/could not load this conversation/i);
  });
});

describe("insertMessage", () => {
  it("inserts the message row with conversation, role, and content", async () => {
    const supabase = createFakeSupabase();

    await expect(
      insertMessage(supabase, {
        conversationId: "conv-1",
        role: "assistant",
        content: "hello there",
      }),
    ).resolves.toBeUndefined();

    expect(supabase.calls.insertedRows[0]).toEqual({
      table: "messages",
      rows: {
        conversation_id: "conv-1",
        role: "assistant",
        content: "hello there",
      },
    });
  });

  it("throws a friendly error when the insert fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase({
      tables: {
        messages: { insert: { error: { message: "fk violation" } } },
      },
    });

    await expect(
      insertMessage(supabase, {
        conversationId: "conv-1",
        role: "user",
        content: "hi",
      }),
    ).rejects.toThrow(/could not save this message/i);
  });
});
