import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";
import type { FakeSupabaseConfig } from "@/tests/helpers/fake-supabase";

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
    supabase: { current: null as unknown },
  };
});

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  unstable_rethrow: mocks.unstable_rethrow,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mocks.supabase.current),
}));

import { signIn, signOut, signUp } from "@/actions/auth";
import type { AuthActionState } from "@/actions/auth";

function useSupabase(config: FakeSupabaseConfig = {}) {
  const client = createFakeSupabase(config);
  mocks.supabase.current = client;
  return client;
}

const IDLE: AuthActionState = { error: null, message: null };

function form(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.redirect.mockClear();
  mocks.unstable_rethrow.mockClear();
  useSupabase();
});

describe("signIn", () => {
  it("requires an email and a password", async () => {
    const missingBoth = await signIn(IDLE, form({}));
    expect(missingBoth.error).toMatch(/email and password are required/i);

    const missingPassword = await signIn(
      IDLE,
      form({ email: "a@b.co" }),
    );
    expect(missingPassword.error).toMatch(/email and password are required/i);
  });

  it("surfaces Supabase credential errors", async () => {
    useSupabase({
      auth: {
        signInWithPassword: { error: { message: "Invalid login credentials" } },
      },
    });

    const state = await signIn(IDLE, form({ email: "a@b.co", password: "nope1234" }));
    expect(state.error).toBe("Invalid login credentials");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects to /dashboard on success", async () => {
    await expect(
      signIn(IDLE, form({ email: "a@b.co", password: "correct horse" })),
    ).rejects.toMatchObject({ url: "/dashboard" });
  });

  it("honors a safe next path", async () => {
    await expect(
      signIn(IDLE, form({ email: "a@b.co", password: "x", next: "/bots/bot-1" })),
    ).rejects.toMatchObject({ url: "/bots/bot-1" });
  });

  it("rewrites unsafe next paths back to /dashboard", async () => {
    await expect(
      signIn(IDLE, form({ email: "a@b.co", password: "x", next: "//evil.example" })),
    ).rejects.toMatchObject({ url: "/dashboard" });
  });
});

describe("signUp", () => {
  it("requires an email and a password", async () => {
    const state = await signUp(IDLE, form({ email: "" }));
    expect(state.error).toMatch(/email and password are required/i);
  });

  it("enforces the minimum password length", async () => {
    const state = await signUp(IDLE, form({ email: "a@b.co", password: "short" }));
    expect(state.error).toMatch(/least 8 characters/i);
  });

  it("asks the user to confirm their email when no session is created", async () => {
    const state = await signUp(IDLE, form({ email: "a@b.co", password: "longenough" }));
    expect(state.error).toBeNull();
    expect(state.message).toMatch(/check your email/i);
  });

  it("redirects straight to the dashboard when a session comes back", async () => {
    useSupabase({
      auth: { signUp: { data: { session: { access_token: "t" } }, error: null } },
    });

    await expect(
      signUp(IDLE, form({ email: "a@b.co", password: "longenough" })),
    ).rejects.toMatchObject({ url: "/dashboard" });
  });
});

describe("signOut", () => {
  it("redirects home after signing out", async () => {
    await expect(signOut()).rejects.toMatchObject({ url: "/" });
  });

  it("still redirects even when Supabase reports a sign-out error", async () => {
    useSupabase({ auth: { signOut: { error: { message: "boom" } } } });

    await expect(signOut()).rejects.toMatchObject({ url: "/" });
  });
});
