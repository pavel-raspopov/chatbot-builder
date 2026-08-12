import type { ReactNode } from "react";
import { BotsList } from "@/components/bots/BotsList";
import { getPlanLimits, normalizePlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export default async function BotsPage(): Promise<ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bots
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          You need to sign in to manage bots.
        </p>
      </div>
    );
  }

  const [profileResult, botsResult] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
    supabase
      .from("bots")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileResult.error || !profileResult.data) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bots
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load your plan. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  if (botsResult.error) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bots
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load your bots. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  const limits = getPlanLimits(normalizePlanId(profileResult.data.plan));
  const bots = botsResult.data ?? [];
  const atBotLimit = bots.length >= limits.maxBots;

  return (
    <BotsList bots={bots} atBotLimit={atBotLimit} maxBots={limits.maxBots} />
  );
}
