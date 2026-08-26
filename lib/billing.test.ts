import { beforeEach, describe, expect, it, vi } from "vitest";
import { applySubscriptionToProfile, findUserIdByCustomerId } from "@/lib/billing";
import type { FakeSupabaseConfig } from "@/tests/helpers/fake-supabase";
import { createFakeSupabase } from "@/tests/helpers/fake-supabase";

const mocks = vi.hoisted(() => ({
  adminClient: { current: null as ReturnType<typeof createFakeSupabase> | null },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mocks.adminClient.current,
}));

function useAdmin(config: FakeSupabaseConfig = {}) {
  const client = createFakeSupabase(config);
  mocks.adminClient.current = client;
  return client;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.adminClient.current = null;
});

describe("applySubscriptionToProfile", () => {
  it("patches the plan, subscription id, and customer id for paid plans", async () => {
    const admin = useAdmin();

    await expect(
      applySubscriptionToProfile({
        userId: "user-1",
        plan: "pro",
        customerId: "cus_123",
        subscriptionId: "sub_123",
      }),
    ).resolves.toEqual({ ok: true });

    expect(admin.calls.updates).toEqual([
      {
        table: "profiles",
        values: {
          plan: "pro",
          stripe_subscription_id: "sub_123",
          stripe_customer_id: "cus_123",
        },
      },
    ]);
  });

  it("omits the customer id when there is none", async () => {
    const admin = useAdmin();

    await applySubscriptionToProfile({
      userId: "user-1",
      plan: "business",
      customerId: null,
      subscriptionId: "sub_123",
    });

    const patch = admin.calls.updates[0]?.values as Record<string, unknown>;
    expect(patch).toEqual({
      plan: "business",
      stripe_subscription_id: "sub_123",
    });
    expect("stripe_customer_id" in patch).toBe(false);
  });

  it("keeps branding intact when applying a paid plan", async () => {
    const admin = useAdmin();
    const botUpdateCountBefore = admin.calls.updates.length;

    await applySubscriptionToProfile({
      userId: "user-1",
      plan: "business",
      customerId: "cus_1",
      subscriptionId: "sub_1",
    });

    expect(admin.calls.updates).toHaveLength(botUpdateCountBefore + 1);
  });

  it("nulls the subscription id on free downgrades even when one is supplied", async () => {
    const admin = useAdmin();

    await applySubscriptionToProfile({
      userId: "user-1",
      plan: "free",
      customerId: "cus_1",
      subscriptionId: "sub_stale",
    });

    const patch = admin.calls.updates.find((u) => u.table === "profiles")
      ?.values as Record<string, unknown>;
    expect(patch.plan).toBe("free");
    expect(patch.stripe_subscription_id).toBeNull();
  });

  it("resets widget branding to false on free plans", async () => {
    const admin = useAdmin();

    await applySubscriptionToProfile({
      userId: "user-1",
      plan: "free",
      customerId: null,
      subscriptionId: null,
    });

    expect(admin.calls.updates).toContainEqual({
      table: "bots",
      values: { remove_branding: false },
    });
    expect(admin.calls.updates).toHaveLength(2);
  });

  it("reports a profile write failure", async () => {
    useAdmin({ tables: { profiles: { update: { error: { message: "denied" } } } } });

    const result = await applySubscriptionToProfile({
      userId: "user-1",
      plan: "pro",
      customerId: null,
      subscriptionId: "sub_1",
    });

    expect(result).toEqual({ ok: false, error: "Could not update the billing plan." });
  });

  it("reports a branding reset failure without retrying", async () => {
    useAdmin({ tables: { bots: { update: { error: { message: "denied" } } } } });

    const result = await applySubscriptionToProfile({
      userId: "user-1",
      plan: "free",
      customerId: null,
      subscriptionId: null,
    });

    expect(result).toEqual({
      ok: false,
      error: "Could not reset widget branding.",
    });
  });
});

describe("findUserIdByCustomerId", () => {
  it("returns the user id when the customer matches", async () => {
    const admin = useAdmin({
      tables: { profiles: { select: { data: { id: "user-9" } } } },
    });

    await expect(findUserIdByCustomerId("cus_123")).resolves.toBe("user-9");
    // Query is service-role scoped against profiles by customer id.
    expect(admin.calls.updates).toHaveLength(0);
  });

  it("returns null when no profile matches", async () => {
    useAdmin({ tables: { profiles: { select: { data: null } } } });

    await expect(findUserIdByCustomerId("cus_none")).resolves.toBeNull();
  });

  it("returns null when the lookup errors", async () => {
    useAdmin({
      tables: { profiles: { select: { error: { message: "down" } } } },
    });

    await expect(findUserIdByCustomerId("cus_x")).resolves.toBeNull();
  });
});
