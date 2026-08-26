import { describe, expect, it } from "vitest";
import {
  canRemoveBranding,
  getPlan,
  getPlanLimits,
  normalizePlanId,
  planLimits,
  plans,
} from "@/lib/plans";

describe("normalizePlanId", () => {
  it("passes through valid plan ids", () => {
    expect(normalizePlanId("free")).toBe("free");
    expect(normalizePlanId("pro")).toBe("pro");
    expect(normalizePlanId("business")).toBe("business");
  });

  it.each([null, undefined, "", "unknown", "FREE", " pro", "enterprise"])(
    "falls back to free for %j",
    (value) => {
      expect(normalizePlanId(value)).toBe("free");
    },
  );
});

describe("getPlan", () => {
  it("returns each plan by id", () => {
    expect(getPlan("free").name).toBe("Free");
    expect(getPlan("pro").name).toBe("Pro");
    expect(getPlan("business").name).toBe("Business");
  });

  it("falls back to free plan for unknown ids", () => {
    expect(getPlan("nope").id).toBe("free");
    expect(getPlan(null).id).toBe("free");
  });
});

describe("getPlanLimits", () => {
  it("matches planLimits per tier", () => {
    expect(getPlanLimits("free")).toEqual(planLimits.free);
    expect(getPlanLimits("pro")).toEqual(planLimits.pro);
    expect(getPlanLimits("business")).toEqual(planLimits.business);
  });

  it("treats unknown ids as free", () => {
    expect(getPlanLimits(undefined)).toEqual(planLimits.free);
  });
});

describe("canRemoveBranding", () => {
  it("is true only for paid plans", () => {
    expect(canRemoveBranding("free")).toBe(false);
    expect(canRemoveBranding("pro")).toBe(true);
    expect(canRemoveBranding("business")).toBe(true);
    expect(canRemoveBranding(null)).toBe(false);
    expect(canRemoveBranding("garbage")).toBe(false);
  });
});

describe("plans catalog", () => {
  it("has exactly three tiers with limits defined", () => {
    expect(plans.map((plan) => plan.id)).toEqual(["free", "pro", "business"]);
    for (const plan of plans) {
      expect(planLimits[plan.id]).toBeDefined();
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });

  it("highlights exactly one plan", () => {
    const highlighted = plans.filter((plan) => plan.highlighted);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]!.id).toBe("pro");
  });

  it("ramps limits upward across tiers", () => {
    expect(planLimits.free.maxBots).toBeLessThan(planLimits.pro.maxBots);
    expect(planLimits.pro.maxBots).toBeLessThan(planLimits.business.maxBots);
    expect(planLimits.free.maxMessagesPerMonth).toBeLessThan(
      planLimits.pro.maxMessagesPerMonth,
    );
    expect(planLimits.pro.maxStorageBytes).toBeLessThan(
      planLimits.business.maxStorageBytes,
    );
  });
});
