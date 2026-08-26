import { afterEach, describe, expect, it } from "vitest";
import {
  isStripeConfigured,
  planIdFromMetadata,
  planIdFromPriceId,
  priceIdForPlan,
  priceIdFromSubscription,
  readStripeId,
} from "@/lib/stripe";
import type { Stripe } from "stripe";

const ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_BUSINESS",
] as const;

const SAVED_ENV = new Map<string, string | undefined>();

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  for (const key of ENV_KEYS) {
    if (key in values) {
      process.env[key] = values[key];
    } else {
      delete process.env[key];
    }
  }
}

afterEach(() => {
  for (const [key, value] of SAVED_ENV) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  SAVED_ENV.clear();
});

function saveEnv() {
  for (const key of ENV_KEYS) {
    SAVED_ENV.set(key, process.env[key]);
  }
}

describe("isStripeConfigured", () => {
  it("is false when any required variable is missing", () => {
    const partials = [
      {},
      { STRIPE_SECRET_KEY: "sk_test_x" },
      { STRIPE_SECRET_KEY: "sk_test_x", STRIPE_PRICE_PRO: "price_pro" },
      { STRIPE_PRICE_PRO: "price_pro", STRIPE_PRICE_BUSINESS: "price_biz" },
    ];
    for (const partial of partials) {
      saveEnv();
      setEnv(partial);
      expect(isStripeConfigured()).toBe(false);
    }
  });

  it("ignores whitespace-only values", () => {
    saveEnv();
    setEnv({
      STRIPE_SECRET_KEY: "  ",
      STRIPE_PRICE_PRO: "price_pro",
      STRIPE_PRICE_BUSINESS: "price_biz",
    });
    expect(isStripeConfigured()).toBe(false);
  });

  it("is true only when all three variables are present", () => {
    saveEnv();
    setEnv({
      STRIPE_SECRET_KEY: "sk_test_x",
      STRIPE_PRICE_PRO: "price_pro",
      STRIPE_PRICE_BUSINESS: "price_biz",
    });
    expect(isStripeConfigured()).toBe(true);
  });
});

describe("priceIdForPlan", () => {
  it("maps pro and business to their configured price ids", () => {
    saveEnv();
    setEnv({
      STRIPE_SECRET_KEY: "sk_test_x",
      STRIPE_PRICE_PRO: "price_pro",
      STRIPE_PRICE_BUSINESS: "price_biz",
    });

    expect(priceIdForPlan("pro")).toBe("price_pro");
    expect(priceIdForPlan("business")).toBe("price_biz");
  });

  it("returns null when the tier's price id is unset", () => {
    saveEnv();
    setEnv({ STRIPE_SECRET_KEY: "sk_test_x" });

    expect(priceIdForPlan("pro")).toBeNull();
    expect(priceIdForPlan("business")).toBeNull();
  });
});

describe("planIdFromPriceId", () => {
  it("recognizes known price ids", () => {
    saveEnv();
    setEnv({
      STRIPE_SECRET_KEY: "sk_test_x",
      STRIPE_PRICE_PRO: "price_pro",
      STRIPE_PRICE_BUSINESS: "price_biz",
    });

    expect(planIdFromPriceId("price_pro")).toBe("pro");
    expect(planIdFromPriceId("price_biz")).toBe("business");
  });

  it("returns null for unknown price ids", () => {
    expect(planIdFromPriceId("price_other")).toBeNull();
    expect(planIdFromPriceId("")).toBeNull();
  });
});

describe("planIdFromMetadata", () => {
  it("returns null for missing metadata or a blank plan value", () => {
    expect(planIdFromMetadata(null)).toBeNull();
    expect(planIdFromMetadata(undefined)).toBeNull();
    expect(planIdFromMetadata({} as Stripe.Metadata)).toBeNull();
    expect(
      planIdFromMetadata({ plan: "   " } as unknown as Stripe.Metadata),
    ).toBeNull();
  });

  it("only accepts already-canonical plan ids (strict raw match)", () => {
    expect(planIdFromMetadata({ plan: "pro" })).toBe("pro");
    expect(planIdFromMetadata({ plan: "free" })).toBe("free");
    // normalizePlanId would map these, but the strict raw check rejects them.
    expect(planIdFromMetadata({ plan: "Pro" })).toBeNull();
    expect(planIdFromMetadata({ plan: " BUSINESS " })).toBeNull();
    expect(planIdFromMetadata({ plan: "garbage" })).toBeNull();
  });
});

describe("readStripeId", () => {
  it("passes strings through and unwraps object ids", () => {
    expect(readStripeId(null)).toBeNull();
    expect(readStripeId(undefined)).toBeNull();
    expect(readStripeId("cus_123")).toBe("cus_123");
    expect(readStripeId({ id: "sub_456" })).toBe("sub_456");
  });
});

describe("priceIdFromSubscription", () => {
  function subscription(price: unknown): Stripe.Subscription {
    return {
      items: { data: price === undefined ? [] : [{ price }] },
    } as unknown as Stripe.Subscription;
  }

  it("unwraps expanded price objects and string ids", () => {
    expect(priceIdFromSubscription(subscription("price_raw"))).toBe(
      "price_raw",
    );
    expect(
      priceIdFromSubscription(subscription({ id: "price_obj" })),
    ).toBe("price_obj");
  });

  it("returns null when there are no items or no price", () => {
    expect(priceIdFromSubscription(subscription(undefined))).toBeNull();
  });
});
