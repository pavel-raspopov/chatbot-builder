import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";
import type { FakeSupabaseConfig } from "@/tests/helpers/fake-supabase";
import { getPlanLimits, normalizePlanId } from "@/lib/plans";

const mocks = vi.hoisted(() => {
  class RedirectError extends Error {
    constructor(readonly url: string) {
      super(`NEXT_REDIRECT:${url}`);
    }
  }
  return {
    RedirectError,
    redirect: vi.fn((url: string): never => {
      throw new RedirectError(url);
    }),
    unstable_rethrow: vi.fn((error: unknown) => {
      if (error instanceof RedirectError) {
        throw error;
      }
    }),
    revalidatePath: vi.fn(),
    supabase: { current: null as unknown },
  };
});

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  unstable_rethrow: mocks.unstable_rethrow,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mocks.supabase.current),
}));

import { createBot, deleteBot, updateBot } from "@/actions/bots";

function useSupabase(config: FakeSupabaseConfig = {}) {
  const client = createFakeSupabase(config);
  mocks.supabase.current = client;
  return client;
}

function form(entries: Record<string, string | null>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (value !== null) {
      formData.set(key, value);
    }
  }
  return formData;
}

const USER_CONFIG: FakeSupabaseConfig = {
  auth: { user: { id: "user-1" } },
};

const FREE_LIMITS = getPlanLimits(normalizePlanId("free"));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.redirect.mockClear();
  mocks.unstable_rethrow.mockClear();
  mocks.revalidatePath.mockClear();
  useSupabase({ auth: { user: null } });
});

describe("createBot", () => {
  it("requires a bot name", async () => {
    const state = await createBot({ error: null }, form({}));
    expect(state.error).toMatch(/name is required/i);
  });

  it("refuses unauthenticated submissions", async () => {
    const state = await createBot({ error: null }, form({ name: "Helper" }));
    expect(state.error).toMatch(/sign in/i);
  });

  it("enforces the plan's bot quota", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        profiles: { select: { data: { plan: "free" } } },
        bots: { select: { data: null, count: FREE_LIMITS.maxBots } },
      },
    });

    const state = await createBot({ error: null }, form({ name: "Too many" }));
    expect(state.error).toBe(
      `Your plan allows ${FREE_LIMITS.maxBots} bot${FREE_LIMITS.maxBots === 1 ? "" : "s"}. Upgrade to create more.`,
    );
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("creates the bot with defaults and redirects to its page", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        profiles: { select: { data: { plan: "free" } } },
        bots: {
          select: [{ data: null, count: 0 }],
          insert: { data: { id: "bot-new" } },
        },
      },
    });

    await expect(
      createBot({ error: null }, form({ name: "  Helper  " })),
    ).rejects.toMatchObject({ url: "/bots/bot-new" });

    const supabase = mocks.supabase.current as ReturnType<
      typeof createFakeSupabase
    >;
    expect(supabase.calls.insertedRows).toContainEqual({
      table: "bots",
      rows: {
        user_id: "user-1",
        name: "Helper",
        welcome_message: "Hi! How can I help you today?",
        system_prompt: "",
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/bots");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});

describe("updateBot", () => {
  it("requires a bot id and a name", async () => {
    const noId = await updateBot({ error: null, message: null }, form({ name: "x" }));
    expect(noId.error).toMatch(/missing bot id/i);

    const noName = await updateBot(
      { error: null, message: null },
      form({ bot_id: "bot-1" }),
    );
    expect(noName.error).toMatch(/name is required/i);
  });

  it("forces branding back on for plans that cannot remove it", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        profiles: { select: { data: { plan: "free" } } },
        bots: { update: { data: { id: "bot-1" } } },
      },
    });

    const state = await updateBot(
      { error: null, message: null },
      form({ bot_id: "bot-1", name: "Renamed", remove_branding: "on" }),
    );

    expect(state.message).toBe("Bot settings saved.");
    const supabase = mocks.supabase.current as ReturnType<
      typeof createFakeSupabase
    >;
    expect(supabase.calls.updates[0]?.values).toMatchObject({
      remove_branding: false,
      name: "Renamed",
    });
  });

  it("reports bots it could not update", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        profiles: { select: { data: { plan: "free" } } },
        bots: { update: { data: null } },
      },
    });

    const state = await updateBot(
      { error: null, message: null },
      form({ bot_id: "ghost", name: "Ghost" }),
    );
    expect(state.error).toMatch(/bot not found/i);
  });
});

describe("deleteBot", () => {
  it("deletes stored files then the bot row", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        bots: {
          select: { data: { id: "bot-1" } },
          delete: { data: null, count: 1 },
        },
        documents: {
          select: {
            data: [{ storage_path: "a.pdf" }, { storage_path: "" }, { storage_path: "b.txt" }],
          },
        },
      },
    });

    const result = await deleteBot("bot-1");

    expect(result).toEqual({ success: true });
    const supabase = mocks.supabase.current as ReturnType<
      typeof createFakeSupabase
    >;
    expect(supabase.calls.storageRemovedPaths).toEqual([["a.pdf", "b.txt"]]);
  });

  it("returns not-found errors without touching storage", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        bots: { select: { data: null } },
        documents: { select: { data: [] } },
      },
    });

    const missingId = await deleteBot("");
    expect(missingId).toEqual({ success: false, error: "Missing bot id." });

    const ghost = await deleteBot("ghost");
    expect(ghost.success).toBe(false);
    expect((ghost as { error: string }).error).toMatch(/bot not found/i);

    const supabase = mocks.supabase.current as ReturnType<
      typeof createFakeSupabase
    >;
    expect(supabase.calls.storageRemovedPaths).toEqual([]);
  });

  it("fails when zero rows were deleted", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        bots: {
          select: { data: { id: "bot-1" } },
          delete: { data: null, count: 0 },
        },
        documents: { select: { data: [] } },
      },
    });

    const result = await deleteBot("bot-vanished-midflight");
    expect(result.success).toBe(false);
    expect((result as { error?: string }).error ?? "").toMatch(
      /not found|failed|went wrong/i,
    );
  });
});

