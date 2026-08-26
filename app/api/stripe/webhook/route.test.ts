import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";

const mocks = vi.hoisted(() => ({
  applySubscriptionToProfile: vi.fn(),
  findUserIdByCustomerId: vi.fn(),
}));

vi.mock("@/lib/billing", () => ({
  applySubscriptionToProfile: mocks.applySubscriptionToProfile,
  findUserIdByCustomerId: mocks.findUserIdByCustomerId,
}));

import { POST } from "@/app/api/stripe/webhook/route";

const SECRET = "whsec_test_local";
const ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_BUSINESS",
  "STRIPE_WEBHOOK_SECRET",
] as const;
const FULL_ENV = {
  STRIPE_SECRET_KEY: "sk_test_webhook_local",
  STRIPE_PRICE_PRO: "price_pro",
  STRIPE_PRICE_BUSINESS: "price_biz",
  STRIPE_WEBHOOK_SECRET: SECRET,
};
const SAVED = new Map<string, string | undefined>();

async function signedRequest(
  event: Record<string, unknown>,
  options: { withSecret?: string; dropSignature?: boolean } = {},
): Promise<Response> {
  const payload = JSON.stringify(event);
  const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ?? "sk_test_webhook_local",
  );
  const secret = options.withSecret ?? process.env.STRIPE_WEBHOOK_SECRET ?? SECRET;
  const headers = new Headers();
  if (!options.dropSignature) {
    const signature =
      await stripe.webhooks.generateTestHeaderString({ payload, secret });
    headers.set("stripe-signature", signature);
  }
  return POST(
    new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: payload,
      headers,
    }),
  );
}

const CHECKOUT_SESSION_COMPLETED = (
  session: Record<string, unknown>,
): Record<string, unknown> => ({
  id: "evt_checkout",
  object: "event",
  type: "checkout.session.completed",
  data: { object: { object: "checkout.session", ...session } },
});

const SUBSCRIPTION_EVENT = (
  type: "customer.subscription.updated" | "customer.subscription.deleted",
  subscription: Record<string, unknown>,
): Record<string, unknown> => ({
  id: `evt_${type}`,
  object: "event",
  type,
  data: { object: { object: "subscription", ...subscription } },
});

const APPLY_OK = { ok: true };

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.applySubscriptionToProfile.mockReset().mockResolvedValue(APPLY_OK);
  mocks.findUserIdByCustomerId.mockReset().mockResolvedValue(null);
  for (const key of ENV_KEYS) {
    if (!SAVED.has(key)) {
      SAVED.set(key, process.env[key]);
    }
    process.env[key] = FULL_ENV[key];
  }
});

afterEach(() => {
  for (const [key, value] of SAVED) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("POST /api/stripe/webhook signatures", () => {
  it("rejects requests without a signature header", async () => {
    const response = await signedRequest({}, { dropSignature: true });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: expect.stringMatching(/missing/i),
    });
  });

  it("rejects signatures produced with a different secret", async () => {
    const response = await signedRequest(
      CHECKOUT_SESSION_COMPLETED({}),
      { withSecret: "whsec_attacker" },
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/invalid.*signature/i);
    expect(mocks.applySubscriptionToProfile).not.toHaveBeenCalled();
  });

  it("reports a configuration problem when the webhook secret is unset", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const response = await signedRequest(CHECKOUT_SESSION_COMPLETED({}));
    expect(response.status).toBe(500);
    expect((await response.json()).error).toMatch(/not configured/i);
  });
});


describe("POST /api/stripe/webhook events", () => {
  it("applies the paid plan on checkout.session.completed", async () => {
    const response = await signedRequest(
      CHECKOUT_SESSION_COMPLETED({
        id: "cs_1",
        mode: "subscription",
        client_reference_id: null,
        customer: "cus_1",
        subscription: { id: "sub_1" },
        metadata: { user_id: "u1", plan: "pro" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mocks.applySubscriptionToProfile).toHaveBeenCalledWith({
      userId: "u1",
      plan: "pro",
      customerId: "cus_1",
      subscriptionId: "sub_1",
    });
  });

  it("falls back to the customer lookup when metadata lacks a user id", async () => {
    mocks.findUserIdByCustomerId.mockResolvedValue("u-by-customer");

    const response = await signedRequest(
      CHECKOUT_SESSION_COMPLETED({
        id: "cs_2",
        mode: "subscription",
        client_reference_id: null,
        customer: "cus_9",
        subscription: "sub_9",
        metadata: { plan: "business" },
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.findUserIdByCustomerId).toHaveBeenCalledWith("cus_9");
    expect(mocks.applySubscriptionToProfile).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u-by-customer", plan: "business" }),
    );
  });

  it("ignores non-subscription checkout sessions", async () => {
    const response = await signedRequest(
      CHECKOUT_SESSION_COMPLETED({
        id: "cs_donation",
        mode: "payment",
        customer: "cus_1",
        metadata: { user_id: "u1", plan: "pro" },
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.applySubscriptionToProfile).not.toHaveBeenCalled();
  });

  it("skips checkout sessions without a resolvable user or plan", async () => {
    const noUser = await signedRequest(
      CHECKOUT_SESSION_COMPLETED({
        id: "cs_nouser",
        mode: "subscription",
        client_reference_id: null,
        customer: null,
        metadata: { plan: "pro" },
      }),
    );
    expect(noUser.status).toBe(200);
    expect(mocks.applySubscriptionToProfile).not.toHaveBeenCalled();
  });
});

describe("subscription lifecycle webhooks", () => {
  const ACTIVE_SUB = {
    id: "sub_live",
    customer: "cus_5",
    status: "active",
    metadata: { user_id: "u5" },
    items: { data: [{ price: { id: "price_biz" } }] },
  };

  it("maps an active subscription's price to its plan (price wins over metadata)", async () => {
    const response = await signedRequest(
      SUBSCRIPTION_EVENT("customer.subscription.updated", {
        ...ACTIVE_SUB,
        metadata: { user_id: "u5", plan: "pro" },
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.applySubscriptionToProfile).toHaveBeenCalledWith({
      userId: "u5",
      plan: "business",
      customerId: "cus_5",
      subscriptionId: "sub_live",
    });
  });

  it("downgrades unpaid subscriptions to free", async () => {
    for (const status of ["canceled", "unpaid", "incomplete"]) {
      mocks.applySubscriptionToProfile.mockClear();

      const response = await signedRequest(
        SUBSCRIPTION_EVENT("customer.subscription.updated", {
          ...ACTIVE_SUB,
          status,
        }),
      );

      expect(response.status).toBe(200);
      expect(mocks.applySubscriptionToProfile).toHaveBeenCalledWith({
        userId: "u5",
        plan: "free",
        customerId: "cus_5",
        subscriptionId: null,
      });
    }
  });

  it("keeps users on unknown paid prices untouched", async () => {
    const response = await signedRequest(
      SUBSCRIPTION_EVENT("customer.subscription.updated", {
        ...ACTIVE_SUB,
        items: { data: [{ price: { id: "price_unknown" } }] },
        metadata: {},
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.applySubscriptionToProfile).not.toHaveBeenCalled();
  });

  it("downgrades deleted subscriptions to free", async () => {
    const response = await signedRequest(
      SUBSCRIPTION_EVENT("customer.subscription.deleted", ACTIVE_SUB),
    );

    expect(response.status).toBe(200);
    expect(mocks.applySubscriptionToProfile).toHaveBeenCalledWith({
      userId: "u5",
      plan: "free",
      customerId: "cus_5",
      subscriptionId: null,
    });
  });

  it("surfaces apply failures as a 500", async () => {
    mocks.applySubscriptionToProfile.mockResolvedValueOnce({
      ok: false,
      error: "Could not update the billing plan.",
    });

    const response = await signedRequest(
      SUBSCRIPTION_EVENT("customer.subscription.deleted", ACTIVE_SUB),
    );

    expect(response.status).toBe(500);
    expect((await response.json()).error).toMatch(/billing plan/i);
  });
});


describe("checkout sessions with unresolved plans are ignored", () => {
  it("skips sessions without a resolvable plan", async () => {
    const noPlan = await signedRequest(
      CHECKOUT_SESSION_COMPLETED({
        id: "cs_noplan",
        mode: "subscription",
        client_reference_id: "u1",
        customer: "cus_1",
        metadata: { user_id: "u1" },
      }),
    );
    expect(noPlan.status).toBe(200);
    expect(mocks.applySubscriptionToProfile).not.toHaveBeenCalled();
  });
});

describe("POST /api/stripe/webhook other events", () => {
  it("acks unrelated event types with 200", async () => {
    const response = await signedRequest({
      id: "evt_other",
      object: "event",
      type: "invoice.paid",
      data: { object: { object: "invoice" } },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mocks.applySubscriptionToProfile).not.toHaveBeenCalled();
  });

  it("ignores checkout/subscription events with unexpected object shapes", async () => {
    const wrongObjectForCheckout = await signedRequest({
      id: "evt_weird",
      object: "event",
      type: "checkout.session.completed",
      data: { object: { object: "subscription", mode: "subscription" } },
    });
    const wrongObjectForSubUpdate = await signedRequest({
      id: "evt_weird2",
      object: "event",
      type: "customer.subscription.updated",
      data: { object: { object: "checkout.session" } },
    });

    expect(wrongObjectForCheckout.status).toBe(200);
    expect(wrongObjectForSubUpdate.status).toBe(200);
    expect(mocks.applySubscriptionToProfile).not.toHaveBeenCalled();
  });
});

