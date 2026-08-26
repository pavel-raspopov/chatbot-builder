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
    isStripeConfigured: vi.fn(() => true),
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  unstable_rethrow: mocks.unstable_rethrow,
}));

vi.mock("@/lib/stripe", async (importOriginal) => {
  void importOriginal;
  return {
    isStripeConfigured: mocks.isStripeConfigured,
    createCheckoutSession: mocks.createCheckoutSession,
    createPortalSession: mocks.createPortalSession,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mocks.supabase.current),
}));

import { startCheckout, startPortal } from "@/actions/billing";
import type { BillingActionState } from "@/actions/billing";

function useSupabase(config: FakeSupabaseConfig = {}) {
  const client = createFakeSupabase(config);
  mocks.supabase.current = client;
  return client;
}

const IDLE: BillingActionState = { error: null };

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
  mocks.isStripeConfigured.mockReset().mockReturnValue(true);
  mocks.createCheckoutSession
    .mockReset()
    .mockResolvedValue({ ok: true, url: "https://checkout.example/pay" });
  mocks.createPortalSession
    .mockReset()
    .mockResolvedValue({ ok: true, url: "https://billing.example/portal" });
  useSupabase({
    auth: { user: { id: "user-1", email: "[EMAIL]" } },
    tables: {
      profiles: {
        select: {
          data: {
            plan: "free",
            stripe_customer_id: null,
            stripe_subscription_id: null,
          },
        },
      },
    },
  });
});

describe("startCheckout plan guards", () => {
  it("declines repeat purchases of the current plan", async () => {
    useSupabase({
      auth: { user: { id: "user-1", email: "[EMAIL]" } },
      tables: {
        profiles: {
          select: {
            data: {
              plan: "pro",
              stripe_customer_id: null,
              stripe_subscription_id: null,
            },
          },
        },
      },
    });

    const state = await startCheckout(IDLE, form({ plan: "pro" }));
    expect(state.error).toMatch(/already on the pro plan/i);
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("points active subscribers at the portal instead", async () => {
    useSupabase({
      auth: { user: { id: "user-1", email: "[EMAIL]" } },
      tables: {
        profiles: {
          select: {
            data: {
              plan: "free",
              stripe_customer_id: "cus_1",
              stripe_subscription_id: "sub_1",
            },
          },
        },
      },
    });

    const state = await startCheckout(IDLE, form({ plan: "pro" }));
    expect(state.error).toMatch(/manage subscription/i);
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });
});

describe("startCheckout redirect flow", () => {
  it("redirects to the Checkout URL on success", async () => {
    await expect(
      startCheckout(IDLE, form({ plan: "business" })),
    ).rejects.toMatchObject({ url: "https://checkout.example/pay" });

    expect(mocks.createCheckoutSession).toHaveBeenCalledWith({
      userId: "user-1",
      email: "[EMAIL]",
      plan: "business",
      customerId: null,
    });
  });

  it("surfaces Checkout failures without redirecting", async () => {
    mocks.createCheckoutSession.mockResolvedValueOnce({
      ok: false,
      error: "No price id configured for business.",
    });

    const state = await startCheckout(IDLE, form({ plan: "business" }));
    expect(state.error).toBe("No price id configured for business.");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe("startPortal", () => {
  it("explains missing Stripe configuration", async () => {
    mocks.isStripeConfigured.mockReturnValue(false);

    const state = await startPortal(IDLE, new FormData());
    expect(state.error).toMatch(/not configured/i);
  });

  it("refuses users without a linked Stripe customer", async () => {
    const state = await startPortal(IDLE, new FormData());
    expect(state.error).toMatch(/no stripe customer/i);
  });

  it("redirects to the portal URL when a customer exists", async () => {
    useSupabase({
      auth: { user: { id: "user-1", email: "[EMAIL]" } },
      tables: {
        profiles: {
          select: { data: { stripe_customer_id: "cus_42" } },
        },
      },
    });

    await expect(startPortal(IDLE, new FormData())).rejects.toMatchObject({
      url: "https://billing.example/portal",
    });
    expect(mocks.createPortalSession).toHaveBeenCalledWith("cus_42");
  });

  it("surfaces portal failures without redirecting", async () => {
    useSupabase({
      auth: { user: { id: "user-1", email: "[EMAIL]" } },
      tables: {
        profiles: {
          select: { data: { stripe_customer_id: "cus_42" } },
        },
      },
    });
    mocks.createPortalSession.mockResolvedValueOnce({
      ok: false,
      error: "Stripe rejected the request.",
    });

    const state = await startPortal(IDLE, new FormData());
    expect(state.error).toBe("Stripe rejected the request.");
  });
});


describe("startCheckout", () => {
  it("explains missing Stripe configuration", async () => {
    mocks.isStripeConfigured.mockReturnValue(false);

    const state = await startCheckout(IDLE, form({ plan: "pro" }));
    expect(state.error).toMatch(/STRIPE_SECRET_KEY/);
  });

  it("only accepts paid plan ids", async () => {
    const state = await startCheckout(IDLE, form({ plan: "free" }));
    expect(state.error).toMatch(/choose pro or business/i);
  });

  it("refuses unauthenticated upgrades", async () => {
    useSupabase({ auth: { user: null } });

    const state = await startCheckout(IDLE, form({ plan: "pro" }));
    expect(state.error).toMatch(/sign in/i);
  });
});
