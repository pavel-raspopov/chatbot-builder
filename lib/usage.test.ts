import { describe, expect, it, vi } from "vitest";
import { getPlanLimits } from "@/lib/plans";
import {
  consumeMessageQuota,
  consumeOwnerMessageQuota,
} from "@/lib/usage";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const OK_ROW = [
  { allowed: true, used: 7, month_limit: 2_000 },
];

describe("consumeMessageQuota", () => {
  it("returns used/limit on the happy path and passes the plan cap", async () => {
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { data: { plan: "pro" } } } },
      rpc: { consume_message_quota: { data: OK_ROW } },
    });

    const result = await consumeMessageQuota(supabase, "user-1");

    expect(result).toEqual({ ok: true, used: 7, limit: 2_000 });
    expect(supabase.calls.rpc[0]).toEqual({
      name: "consume_message_quota",
      args: { p_max: getPlanLimits("pro").maxMessagesPerMonth },
    });
  });

  it("fails closed with 500 when the profile cannot be loaded", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { error: { message: "down" } } } },
    });

    const result = await consumeMessageQuota(supabase, "user-1");

    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining("Could not check your message quota"),
      statusCode: 500,
    });
    expect(supabase.calls.rpc).toHaveLength(0);
  });

  it("fails closed with 500 when the profile row is missing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase();

    const result = await consumeMessageQuota(supabase, "ghost");

    if (!result.ok) {
      expect(result.statusCode).toBe(500);
    } else {
      expect.unreachable("quota should fail when the profile row is missing");
    }
  });

  it("detects a missing RPC and asks for migrations", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { data: { plan: "free" } } } },
      rpc: {
        consume_message_quota: {
          error: { code: "PGRST202", message: "Could not find the function" },
        },
      },
    });

    const result = await consumeMessageQuota(supabase, "user-1");

    expect(result).toEqual({
      ok: false,
      error: expect.stringMatching(/not configured[\s\S]*migration/i),
      statusCode: 500,
    });
  });

  it("maps other RPC errors to a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { data: { plan: "free" } } } },
      rpc: {
        consume_message_quota: { error: { code: "XX000", message: "boom" } },
      },
    });

    const result = await consumeMessageQuota(supabase, "user-1");

    expect(result).toMatchObject({ ok: false, statusCode: 500 });
    if (!result.ok) {
      expect(result.error).not.toMatch(/not configured/i);
    }
  });

  it("returns 429 with an upgrade prompt when the cap is reached", async () => {
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { data: { plan: "free" } } } },
      rpc: {
        consume_message_quota: {
          data: [{ allowed: false, used: 50, month_limit: 50 }],
        },
      },
    });

    const result = await consumeMessageQuota(supabase, "user-1");

    expect(result).toEqual({
      ok: false,
      error: expect.stringMatching(/monthly message limit[\s\S]*upgrade/i),
      statusCode: 429,
    });
  });

  it("rejects malformed RPC payloads with 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const badPayloads: unknown[] = [
      null,
      "nope",
      {},
      { allowed: "yes", used: 1, month_limit: 10 },
      [{ allowed: true, used: "one", month_limit: 10 }],
    ];
    for (const payload of badPayloads) {
      const supabase = createFakeSupabase({
        tables: { profiles: { select: { data: { plan: "free" } } } },
        rpc: { consume_message_quota: { data: payload } },
      });

      const result = await consumeMessageQuota(supabase, "user-1");
      expect(result).toMatchObject({ ok: false, statusCode: 500 });
    }
  });
});


describe("consumeOwnerMessageQuota", () => {
  it("targets the owner id and the plan cap from their profile", async () => {
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { data: { plan: "business" } } } },
      rpc: { consume_owner_message_quota: { data: OK_ROW } },
    });

    const result = await consumeOwnerMessageQuota(supabase, "owner-1");

    expect(result).toEqual({ ok: true, used: 7, limit: 2_000 });
    expect(supabase.calls.rpc[0]).toEqual({
      name: "consume_owner_message_quota",
      args: {
        p_user_id: "owner-1",
        p_max: getPlanLimits("business").maxMessagesPerMonth,
      },
    });
  });

  it("returns 429 with a bot-specific message when exhausted", async () => {
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { data: { plan: "pro" } } } },
      rpc: {
        consume_owner_message_quota: {
          data: [{ allowed: false, used: 2000, month_limit: 2000 }],
        },
      },
    });

    const result = await consumeOwnerMessageQuota(supabase, "owner-1");

    expect(result).toEqual({
      ok: false,
      error: "This bot has reached its monthly message limit.",
      statusCode: 429,
    });
  });

  it("falls back to free-plan limits for a garbage plan value", async () => {
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { data: { plan: "???" } } } },
      rpc: { consume_owner_message_quota: { data: OK_ROW } },
    });

    const result = await consumeOwnerMessageQuota(supabase, "owner-1");

    expect(result).toEqual({ ok: true, used: 7, limit: 2_000 });
    expect(supabase.calls.rpc[0]?.args.p_max).toBe(
      getPlanLimits("free").maxMessagesPerMonth,
    );
  });

  it("reports load failures against the owner profile", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase({
      tables: { profiles: { select: { error: { message: "down" } } } },
    });

    const result = await consumeOwnerMessageQuota(supabase, "owner-1");

    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining("this bot’s message quota"),
      statusCode: 500,
    });
  });
});
