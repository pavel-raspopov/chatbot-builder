import { describe, expect, it, vi } from "vitest";
import { getBotWidgetConfig } from "@/lib/widget/getBotConfig";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const VALID_ROW = {
  public_id: "abc123",
  name: "Support Bot",
  welcome_message: "Hi!",
  remove_branding: false,
};

describe("getBotWidgetConfig", () => {
  it("short-circuits to null for blank ids without calling the RPC", async () => {
    for (const publicId of ["", "   ", "\t\n"]) {
      const supabase = createFakeSupabase();
      await expect(getBotWidgetConfig(supabase, publicId)).resolves.toBeNull();
      expect(supabase.calls.rpc).toHaveLength(0);
    }
  });

  it("trims the public id before querying", async () => {
    const supabase = createFakeSupabase({
      rpc: { get_bot_widget_config: { data: VALID_ROW } },
    });

    await expect(
      getBotWidgetConfig(supabase, "  abc123  "),
    ).resolves.toEqual(VALID_ROW);
    expect(supabase.calls.rpc[0]).toEqual({
      name: "get_bot_widget_config",
      args: { p_public_id: "abc123" },
    });
  });

  it("returns null when the RPC errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const supabase = createFakeSupabase({
      rpc: { get_bot_widget_config: { error: { message: "denied" } } },
    });

    await expect(getBotWidgetConfig(supabase, "abc")).resolves.toBeNull();
  });

  it("accepts a row wrapped in an array", async () => {
    const supabase = createFakeSupabase({
      rpc: { get_bot_widget_config: { data: [VALID_ROW] } },
    });

    await expect(getBotWidgetConfig(supabase, "abc")).resolves.toEqual(
      VALID_ROW,
    );
  });

  it("returns null for non-object payloads", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const payload of [null, undefined, "row", 42]) {
      const supabase = createFakeSupabase({
        rpc: { get_bot_widget_config: { data: payload } },
      });
      await expect(getBotWidgetConfig(supabase, "abc")).resolves.toBeNull();
    }
  });

  it("rejects rows whose fields have the wrong types", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const invalidRows: Array<Record<string, unknown>> = [
      {},
      { ...VALID_ROW, public_id: 7 },
      { ...VALID_ROW, name: null },
      { ...VALID_ROW, welcome_message: 11 },
      { ...VALID_ROW, remove_branding: "false" },
    ];
    for (const row of invalidRows) {
      const supabase = createFakeSupabase({
        rpc: { get_bot_widget_config: { data: row } },
      });
      await expect(getBotWidgetConfig(supabase, "abc")).resolves.toBeNull();
    }
  });
});
