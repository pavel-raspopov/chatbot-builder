import type { ReactNode } from "react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { getPlan, getPlanLimits, normalizePlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage(): Promise<ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          You need to sign in to view the dashboard.
        </p>
      </div>
    );
  }

  const [profileResult, botsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, plan, messages_used_month")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("bots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  if (profileResult.error) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load your profile. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  if (!profileResult.data) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Your account profile is missing. Sign out and sign up again, or
          contact support if this persists.
        </p>
      </div>
    );
  }

  if (botsResult.error) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load your bots. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  const planId = normalizePlanId(profileResult.data.plan);
  const plan = getPlan(planId);
  const limits = getPlanLimits(planId);
  const botCount = botsResult.count ?? 0;
  const messagesUsed = profileResult.data.messages_used_month;
  const atBotLimit = botCount >= limits.maxBots;
  const atMessageLimit = messagesUsed >= limits.maxMessagesPerMonth;
  const showUpgrade =
    planId === "free" || atBotLimit || atMessageLimit;

  return (
    <DashboardOverview
      email={profileResult.data.email}
      planName={plan.name}
      planId={planId}
      botCount={botCount}
      maxBots={limits.maxBots}
      messagesUsed={messagesUsed}
      maxMessages={limits.maxMessagesPerMonth}
      atBotLimit={atBotLimit}
      showUpgrade={showUpgrade}
    />
  );
}
