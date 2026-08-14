import Stripe from "stripe";
import { getAppOrigin } from "@/lib/app-url";
import { normalizePlanId, type PlanId } from "@/lib/plans";

export type PaidPlanId = Exclude<PlanId, "free">;

export type StripeSessionResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

let stripeClient: Stripe | null = null;

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    readEnv("STRIPE_SECRET_KEY") &&
      readEnv("STRIPE_PRICE_PRO") &&
      readEnv("STRIPE_PRICE_BUSINESS"),
  );
}

export function getStripeWebhookSecret(): string | null {
  return readEnv("STRIPE_WEBHOOK_SECRET");
}

export function getStripeClient(): Stripe | null {
  const key = readEnv("STRIPE_SECRET_KEY");
  if (!key) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function priceIdForPlan(plan: PaidPlanId): string | null {
  if (plan === "pro") {
    return readEnv("STRIPE_PRICE_PRO");
  }
  return readEnv("STRIPE_PRICE_BUSINESS");
}

export function planIdFromPriceId(priceId: string): PlanId | null {
  const pro = readEnv("STRIPE_PRICE_PRO");
  const business = readEnv("STRIPE_PRICE_BUSINESS");
  if (pro && priceId === pro) {
    return "pro";
  }
  if (business && priceId === business) {
    return "business";
  }
  return null;
}

export function planIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): PlanId | null {
  if (!metadata) {
    return null;
  }
  const raw = metadata.plan?.trim();
  if (!raw) {
    return null;
  }
  const plan = normalizePlanId(raw);
  if (raw !== plan) {
    return null;
  }
  return plan;
}

function billingOrigin(): string {
  return getAppOrigin();
}

export async function createCheckoutSession(input: {
  userId: string;
  email: string;
  plan: PaidPlanId;
  customerId: string | null;
}): Promise<StripeSessionResult> {
  const stripe = getStripeClient();
  if (!stripe) {
    return {
      ok: false,
      error: "Stripe is not configured. Add test keys to .env.local.",
    };
  }

  const priceId = priceIdForPlan(input.plan);
  if (!priceId) {
    return {
      ok: false,
      error: "Stripe price IDs are not configured. Add STRIPE_PRICE_PRO and STRIPE_PRICE_BUSINESS.",
    };
  }

  const origin = billingOrigin();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: input.userId,
    customer: input.customerId || undefined,
    customer_email: input.customerId ? undefined : input.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings/billing?checkout=success`,
    cancel_url: `${origin}/settings/billing?checkout=canceled`,
    metadata: { user_id: input.userId, plan: input.plan },
    subscription_data: {
      metadata: { user_id: input.userId, plan: input.plan },
    },
  });

  if (!session.url) {
    return {
      ok: false,
      error: "Stripe did not return a Checkout URL. Please try again.",
    };
  }

  return { ok: true, url: session.url };
}

export async function createPortalSession(
  customerId: string,
): Promise<StripeSessionResult> {
  const stripe = getStripeClient();
  if (!stripe) {
    return {
      ok: false,
      error: "Stripe is not configured. Add test keys to .env.local.",
    };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${billingOrigin()}/settings/billing`,
  });

  return { ok: true, url: session.url };
}

export function constructStripeEvent(
  payload: string,
  signature: string,
): Stripe.Event {
  const stripe = getStripeClient();
  const secret = getStripeWebhookSecret();
  if (!stripe || !secret) {
    throw new Error("Stripe webhook is not configured.");
  }
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export function isStripeSignatureError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "StripeSignatureVerificationError"
  );
}

export function readStripeId(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  return value.id;
}

export function priceIdFromSubscription(
  subscription: Stripe.Subscription,
): string | null {
  const item = subscription.items.data[0];
  const price = item?.price;
  if (!price) {
    return null;
  }
  if (typeof price === "string") {
    return price;
  }
  return price.id;
}
