"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { normalizePlanId } from "@/lib/plans";
import {
  createCheckoutSession,
  createPortalSession,
  isStripeConfigured,
  type PaidPlanId,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export type BillingActionState = {
  error: string | null;
};

function isPaidPlanId(value: string): value is PaidPlanId {
  return value === "pro" || value === "business";
}

function readPlan(formData: FormData): PaidPlanId | null {
  const value = formData.get("plan");
  if (typeof value !== "string") {
    return null;
  }
  return isPaidPlanId(value) ? value : null;
}

export async function startCheckout(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  try {
    if (!isStripeConfigured()) {
      return {
        error:
          "Stripe test keys are not configured. Add STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, and STRIPE_PRICE_BUSINESS to .env.local.",
      };
    }

    const plan = readPlan(formData);
    if (!plan) {
      return { error: "Choose Pro or Business to upgrade." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You need to sign in to upgrade." };
    }

    const email = user.email?.trim();
    if (!email) {
      return { error: "Your account is missing an email address." };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("plan, stripe_customer_id, stripe_subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) {
      return { error: "Could not load your plan. Please try again." };
    }

    const currentPlan = normalizePlanId(profile.plan);
    if (currentPlan === plan) {
      return { error: `You are already on the ${plan} plan.` };
    }

    if (profile.stripe_subscription_id) {
      return {
        error: "Use Manage subscription to change or cancel your paid plan.",
      };
    }

    const result = await createCheckoutSession({
      userId: user.id,
      email,
      plan,
      customerId: profile.stripe_customer_id,
    });

    if (!result.ok) {
      return { error: result.error };
    }

    redirect(result.url);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/billing] startCheckout", error);
    return { error: "Could not start Checkout. Please try again." };
  }
}

export async function startPortal(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  void formData;
  try {
    if (!isStripeConfigured()) {
      return {
        error:
          "Stripe test keys are not configured. Add STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, and STRIPE_PRICE_BUSINESS to .env.local.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You need to sign in to manage billing." };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) {
      return { error: "Could not load your billing profile. Please try again." };
    }

    if (!profile.stripe_customer_id) {
      return { error: "No Stripe customer is linked to this account yet." };
    }

    const result = await createPortalSession(profile.stripe_customer_id);
    if (!result.ok) {
      return { error: result.error };
    }

    redirect(result.url);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[actions/billing] startPortal", error);
    return { error: "Could not open the billing portal. Please try again." };
  }
}
