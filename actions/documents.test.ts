import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";
import type { FakeSupabaseConfig } from "@/tests/helpers/fake-supabase";
import { getPlanLimits, normalizePlanId } from "@/lib/plans";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  supabase: { current: null as unknown },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  unstable_rethrow: (error: unknown) => {
    throw error;
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mocks.supabase.current),
}));

import { createDocument, deleteDocument } from "@/actions/documents";

function useSupabase(config: FakeSupabaseConfig = {}) {
  const client = createFakeSupabase(config);
  mocks.supabase.current = client;
  return client;
}

const USER_CONFIG: FakeSupabaseConfig = {
  auth: { user: { id: "user-1" } },
};

const FREE_LIMITS = getPlanLimits(normalizePlanId("free"));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.revalidatePath.mockClear();
  useSupabase({ auth: { user: null } });
});

describe("createDocument", () => {
  const VALID_INPUT = {
    filename: "handbook.pdf",
    mimeType: "application/pdf",
    byteSize: 1024,
  };

  it("rejects missing bot ids before touching Supabase", async () => {
    const result = await createDocument("", VALID_INPUT);
    expect(result).toEqual({ success: false, error: "Missing bot id." });
  });

  it("validates the document metadata", async () => {
    const result = await createDocument("bot-1", { ...VALID_INPUT, filename: "" });
    expect(result.success).toBe(false);
    expect((result as { error?: string }).error ?? "").toBeTruthy();
  });

  it("refuses unauthenticated uploads", async () => {
    const result = await createDocument("bot-1", VALID_INPUT);
    expect((result as { error?: string }).error).toMatch(/sign in/i);
  });

  it("enforces the plan storage quota", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        bots: { select: { data: { id: "bot-1" } } },
        profiles: { select: { data: { plan: "free" } } },
        documents: {
          select: { data: [{ byte_size: FREE_LIMITS.maxStorageBytes }] },
        },
      },
    });

    const result = await createDocument("bot-1", VALID_INPUT);
    expect(result.success).toBe(false);
    expect((result as { error?: string }).error).toMatch(
      /your plan allows .* of storage/i,
    );
  });
});

describe("createDocument success and insert failures", () => {
  const VALID_INPUT = {
    filename: "handbook.pdf",
    mimeType: "application/pdf",
    byteSize: 1024,
  };

  it("creates a pending document row with the built storage path", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        bots: { select: { data: { id: "bot-1" } } },
        profiles: { select: { data: { plan: "free" } } },
        documents: {
          select: { data: [{ byte_size: 0 }] },
          insert: { data: null },
        },
      },
    });

    const result = await createDocument("bot-1", VALID_INPUT);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.storagePath).toContain("user-1");
    expect(result.storagePath).toContain("bot-1");
    expect(result.storagePath).toContain("handbook.pdf");

    const supabase = mocks.supabase.current as ReturnType<
      typeof createFakeSupabase
    >;
    expect(supabase.calls.insertedRows[0]?.rows).toMatchObject({
      id: result.documentId,
      bot_id: "bot-1",
      user_id: "user-1",
      filename: "handbook.pdf",
      mime_type: "application/pdf",
      byte_size: 1024,
      status: "pending",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/bots/bot-1");
  });

  it("surfaces insert failures", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        bots: { select: { data: { id: "bot-1" } } },
        profiles: { select: { data: { plan: "free" } } },
        documents: {
          select: { data: [] },
          insert: { error: { message: "duplicate key" } },
        },
      },
    });

    const result = await createDocument("bot-1", VALID_INPUT);
    expect(result.success).toBe(false);
    expect((result as { error?: string }).error).toMatch(/failed to create/i);
  });
});

describe("deleteDocument", () => {
  it("requires a document id", async () => {
    const result = await deleteDocument("");
    expect(result).toEqual({ success: false, error: "Missing document id." });
  });

  it("refuses unauthenticated deletes", async () => {
    const result = await deleteDocument("doc-1");
    expect((result as { error?: string }).error).toMatch(/sign in/i);
  });

  it("reports documents that are missing or owned by someone else", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: { documents: { select: { data: null } } },
    });

    const ghost = await deleteDocument("ghost");
    expect(ghost).toEqual({ success: false, error: "Document not found." });
  });

  it("removes the stored object then the row", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        documents: {
          select: {
            data: { id: "doc-1", bot_id: "bot-1", storage_path: "p.pdf" },
          },
          delete: { data: null, count: 1 },
        },
      },
    });

    const result = await deleteDocument("doc-1");

    expect(result).toEqual({ success: true });
    const supabase = mocks.supabase.current as ReturnType<
      typeof createFakeSupabase
    >;
    expect(supabase.calls.storageRemovedPaths).toEqual([["p.pdf"]]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/bots/bot-1");
  });

  it("fails when zero rows were deleted", async () => {
    useSupabase({
      ...USER_CONFIG,
      tables: {
        documents: {
          select: {
            data: { id: "doc-1", bot_id: "bot-1", storage_path: "p.pdf" },
          },
          delete: { data: null, count: 0 },
        },
      },
    });

    const result = await deleteDocument("doc-1");
    expect(result.success).toBe(false);
  });
});

