import type { PlanId } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";

export type ApplySubscriptionInput = {
  userId: string;
  plan: PlanId;
  customerId: string | null;
  subscriptionId: string | null;
};

export type ApplySubscriptionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Service-role write of plan + Stripe ids. Authenticated clients cannot UPDATE
 * these profile columns. Idempotent.
 */
export async function applySubscriptionToProfile(
  input: ApplySubscriptionInput,
): Promise<ApplySubscriptionResult> {
  const admin = createAdminClient();
  const subscriptionId = input.plan === "free" ? null : input.subscriptionId;

  const patch: {
    plan: PlanId;
    stripe_subscription_id: string | null;
    stripe_customer_id?: string;
  } = {
    plan: input.plan,
    stripe_subscription_id: subscriptionId,
  };

  if (input.customerId) {
    patch.stripe_customer_id = input.customerId;
  }

  const { error } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", input.userId);

  if (error) {
    console.error("[lib/billing] apply profile", error);
    return { ok: false, error: "Could not update the billing plan." };
  }

  if (input.plan === "free") {
    const { error: brandingError } = await admin
      .from("bots")
      .update({ remove_branding: false })
      .eq("user_id", input.userId);

    if (brandingError) {
      console.error("[lib/billing] reset branding", brandingError);
      return { ok: false, error: "Could not reset widget branding." };
    }
  }

  return { ok: true };
}

export async function findUserIdByCustomerId(
  customerId: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) {
    console.error("[lib/billing] find customer", error);
    return null;
  }

  return data?.id ?? null;
}
