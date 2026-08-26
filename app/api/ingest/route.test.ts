import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const mocks = vi.hoisted(() => ({
  supabase: { current: null as unknown },
  ingestDocument: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mocks.supabase.current),
}));

vi.mock("@/lib/rag/ingest", () => ({
  ingestDocument: mocks.ingestDocument,
}));

import { POST } from "@/app/api/ingest/route";

function useSupabase(user?: { id: string }) {
  const client = createFakeSupabase({ auth: { user: user ?? null } });
  mocks.supabase.current = client;
  return client;
}

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/ingest", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.ingestDocument
    .mockReset()
    .mockResolvedValue({ success: true, chunkCount: 12 });
  useSupabase({ id: "user-1" });
});

describe("POST /api/ingest", () => {
  it("rejects an invalid JSON body with 400", async () => {
    const response = await POST(
      new Request("http://localhost/api/ingest", {
        method: "POST",
        body: "not json",
      }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/invalid json/i);
  });

  it("requires a document id", async () => {
    const response = await POST(postRequest({ force: true }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/missing document id/i);
    expect(mocks.ingestDocument).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    useSupabase();
    const response = await POST(postRequest({ documentId: "doc-1" }));
    expect(response.status).toBe(401);
    expect(mocks.ingestDocument).not.toHaveBeenCalled();
  });

  it("delegates to ingestDocument with the caller and force flag", async () => {
    const supabase = useSupabase({ id: "user-9" });

    const response = await POST(
      postRequest({ documentId: "doc-7", force: true }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, chunkCount: 12 });
    expect(mocks.ingestDocument).toHaveBeenCalledWith(
      supabase,
      "doc-7",
      "user-9",
      { force: true },
    );
  });

  it("defaults force to false when omitted or not exactly true", async () => {
    await POST(postRequest({ documentId: "doc-1" }));
    expect(mocks.ingestDocument.mock.calls[0]?.[3]).toEqual({ force: false });

    await POST(postRequest({ documentId: "doc-1", force: "yes" }));
    expect(mocks.ingestDocument.mock.calls[1]?.[3]).toEqual({ force: false });
  });

  it("maps ingest failures to the reported status code", async () => {
    mocks.ingestDocument.mockResolvedValueOnce({
      success: false,
      error: "No readable text found in this file.",
      statusCode: 422,
    });

    const response = await POST(postRequest({ documentId: "doc-1" }));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      success: false,
      error: "No readable text found in this file.",
    });
  });

  it("wraps unexpected ingest throws in a 500", async () => {
    mocks.ingestDocument.mockRejectedValueOnce(new Error("crash"));

    const response = await POST(postRequest({ documentId: "doc-1" }));
    expect(response.status).toBe(500);
    expect((await response.json()).success).toBe(false);
  });
});
