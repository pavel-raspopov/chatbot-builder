import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { UsageMeter } from "@/components/ui/UsageMeter";
import { formatBytes } from "@/lib/documents";
import { getPlan, getPlanLimits, normalizePlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export default async function BillingPage(): Promise<ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Billing
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          You need to sign in to view billing.
        </p>
      </div>
    );
  }

  const [profileResult, botsResult, usageResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, plan, messages_used_month")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("bots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase.from("documents").select("byte_size").eq("user_id", user.id),
  ]);

  if (profileResult.error || !profileResult.data) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Billing
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load your plan. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  if (botsResult.error || usageResult.error) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Billing
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load usage. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  const planId = normalizePlanId(profileResult.data.plan);
  const plan = getPlan(planId);
  const limits = getPlanLimits(planId);
  const botCount = botsResult.count ?? 0;
  const messagesUsed = profileResult.data.messages_used_month;
  const usedBytes = (usageResult.data ?? []).reduce(
    (sum, row) => sum + (row.byte_size ?? 0),
    0,
  );

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Billing
        </h1>
        <span className="inline-flex items-center rounded-md bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
          {plan.name}
        </span>
      </div>

      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        You are on the {plan.name} plan
        {planId === "free" ? " (forever free to try)" : ` (${plan.priceLabel}/mo)`}
        . Stripe Checkout for upgrades ships in the billing phase — no charges
        yet.
      </p>

      <div className="mt-8 space-y-5">
        <UsageMeter label="Bots" used={botCount} limit={limits.maxBots} />
        <UsageMeter
          label="Messages this month"
          used={messagesUsed}
          limit={limits.maxMessagesPerMonth}
        />
        <UsageMeter
          label="Document storage"
          used={usedBytes}
          limit={limits.maxStorageBytes}
          valueLabel={`${formatBytes(usedBytes)} / ${formatBytes(limits.maxStorageBytes)}`}
        />
      </div>

      <p className="mt-8 text-sm text-text-secondary">
        Signed in as{" "}
        <span className="font-medium text-text-primary">
          {profileResult.data.email}
        </span>
      </p>

      <div className="mt-8">
        <Button href="/dashboard" variant="secondary">
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
