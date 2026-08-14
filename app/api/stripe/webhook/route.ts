import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  applySubscriptionToProfile,
  findUserIdByCustomerId,
} from "@/lib/billing";
import type { PlanId } from "@/lib/plans";
import {
  constructStripeEvent,
  isStripeSignatureError,
  planIdFromMetadata,
  planIdFromPriceId,
  priceIdFromSubscription,
  readStripeId,
} from "@/lib/stripe";

export const runtime = "nodejs";

function json(success: boolean, status: number, error?: string): NextResponse {
  if (error) {
    return NextResponse.json({ success, error }, { status });
  }
  return NextResponse.json({ success }, { status });
}

function isCheckoutSession(
  value: Stripe.Event.Data.Object,
): value is Stripe.Checkout.Session {
  return "object" in value && value.object === "checkout.session";
}

function isSubscription(
  value: Stripe.Event.Data.Object,
): value is Stripe.Subscription {
  return "object" in value && value.object === "subscription";
}

async function resolveUserId(
  metadataUserId: string | null,
  customerId: string | null,
): Promise<string | null> {
  if (metadataUserId) {
    return metadataUserId;
  }
  if (customerId) {
    return findUserIdByCustomerId(customerId);
  }
  return null;
}

function paidStatus(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (session.mode !== "subscription") {
    return { ok: true };
  }

  const userId = await resolveUserId(
    session.metadata?.user_id?.trim() || session.client_reference_id,
    readStripeId(session.customer),
  );
  if (!userId) {
    console.error("[api/stripe/webhook] checkout: missing user id", session.id);
    return { ok: true };
  }

  const planFromMeta = planIdFromMetadata(session.metadata);
  if (!planFromMeta || planFromMeta === "free") {
    console.error("[api/stripe/webhook] checkout: missing plan", session.id);
    return { ok: true };
  }

  const plan: PlanId = planFromMeta;
  const customerId = readStripeId(session.customer);
  const subscriptionId = readStripeId(session.subscription);

  const applied = await applySubscriptionToProfile({
    userId,
    plan,
    customerId,
    subscriptionId,
  });

  if (!applied.ok) {
    return { ok: false, error: applied.error, status: 500 };
  }

  return { ok: true };
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const customerId = readStripeId(subscription.customer);
  const userId = await resolveUserId(
    subscription.metadata?.user_id?.trim() ?? null,
    customerId,
  );
  if (!userId) {
    console.error(
      "[api/stripe/webhook] subscription.updated: missing user",
      subscription.id,
    );
    return { ok: true };
  }

  if (!paidStatus(subscription.status)) {
    const applied = await applySubscriptionToProfile({
      userId,
      plan: "free",
      customerId,
      subscriptionId: null,
    });
    if (!applied.ok) {
      return { ok: false, error: applied.error, status: 500 };
    }
    return { ok: true };
  }

  const priceId = priceIdFromSubscription(subscription);
  const planFromPrice = priceId ? planIdFromPriceId(priceId) : null;
  const planFromMeta = planIdFromMetadata(subscription.metadata);
  const plan = planFromPrice ?? planFromMeta;

  if (!plan || plan === "free") {
    console.error(
      "[api/stripe/webhook] subscription.updated: unknown price",
      priceId,
    );
    return { ok: true };
  }

  const applied = await applySubscriptionToProfile({
    userId,
    plan,
    customerId,
    subscriptionId: subscription.id,
  });

  if (!applied.ok) {
    return { ok: false, error: applied.error, status: 500 };
  }

  return { ok: true };
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const customerId = readStripeId(subscription.customer);
  const userId = await resolveUserId(
    subscription.metadata?.user_id?.trim() ?? null,
    customerId,
  );
  if (!userId) {
    console.error(
      "[api/stripe/webhook] subscription.deleted: missing user",
      subscription.id,
    );
    return { ok: true };
  }

  const applied = await applySubscriptionToProfile({
    userId,
    plan: "free",
    customerId,
    subscriptionId: null,
  });

  if (!applied.ok) {
    return { ok: false, error: applied.error, status: 500 };
  }

  return { ok: true };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return json(false, 400, "Missing Stripe signature.");
    }

    let event: Stripe.Event;
    try {
      const raw = await request.text();
      event = constructStripeEvent(raw, signature);
    } catch (error) {
      if (isStripeSignatureError(error)) {
        console.error("[api/stripe/webhook] signature", error);
        return json(false, 400, "Invalid Stripe signature.");
      }
      console.error("[api/stripe/webhook] construct", error);
      return json(false, 500, "Stripe webhook is not configured.");
    }

    const object = event.data.object;

    if (event.type === "checkout.session.completed") {
      if (!isCheckoutSession(object)) {
        return json(true, 200);
      }
      const result = await handleCheckoutCompleted(object);
      if (!result.ok) {
        return json(false, result.status, result.error);
      }
      return json(true, 200);
    }

    if (event.type === "customer.subscription.updated") {
      if (!isSubscription(object)) {
        return json(true, 200);
      }
      const result = await handleSubscriptionUpdated(object);
      if (!result.ok) {
        return json(false, result.status, result.error);
      }
      return json(true, 200);
    }

    if (event.type === "customer.subscription.deleted") {
      if (!isSubscription(object)) {
        return json(true, 200);
      }
      const result = await handleSubscriptionDeleted(object);
      if (!result.ok) {
        return json(false, result.status, result.error);
      }
      return json(true, 200);
    }

    return json(true, 200);
  } catch (error) {
    console.error("[api/stripe/webhook]", error);
    return json(false, 500, "Internal server error");
  }
}
