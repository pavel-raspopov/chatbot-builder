import Link from "next/link";
import type { ReactNode } from "react";
import { CreateBotForm } from "@/components/bots/CreateBotForm";
import { Button } from "@/components/ui/Button";
import { getPlanLimits, normalizePlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export default async function NewBotPage(): Promise<ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Create bot
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          You need to sign in to create a bot.
        </p>
      </div>
    );
  }

  const [profileResult, botsResult] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
    supabase
      .from("bots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  if (profileResult.error || !profileResult.data) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Create bot
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
          Create bot
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not check your bot limit. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  const limits = getPlanLimits(normalizePlanId(profileResult.data.plan));
  const botCount = botsResult.count ?? 0;
  const atBotLimit = botCount >= limits.maxBots;

  if (atBotLimit) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Create bot
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          Your plan allows {limits.maxBots} bot
          {limits.maxBots === 1 ? "" : "s"}. Upgrade to create more.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/settings/billing" variant="primary">
            Upgrade
          </Button>
          <Button href="/bots" variant="secondary">
            Back to bots
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-text-secondary">
        <Link
          href="/bots"
          className="font-medium text-accent hover:text-accent-dark focus:outline-none focus:ring-1 focus:ring-accent"
        >
          Bots
        </Link>
        <span className="text-text-muted"> / New</span>
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary">
        Create bot
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Name your bot and set how it greets visitors. You can upload docs next.
      </p>
      <CreateBotForm />
    </div>
  );
}
