import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

type BotDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BotDetailPage({
  params,
}: BotDetailPageProps): Promise<ReactNode> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bot
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          You need to sign in to view this bot.
        </p>
      </div>
    );
  }

  const { data: bot, error } = await supabase
    .from("bots")
    .select("id, name, welcome_message, system_prompt, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bot
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load this bot. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bot not found
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          This bot does not exist or you do not have access to it.
        </p>
        <div className="mt-8">
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
        <span className="text-text-muted"> / {bot.name}</span>
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary">
        {bot.name}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Document upload comes next. For now your bot is saved with its welcome
        message and system prompt.
      </p>

      <dl className="mt-8 space-y-5">
        <div>
          <dt className="text-sm font-medium text-text-primary">
            Welcome message
          </dt>
          <dd className="mt-1 text-base leading-relaxed text-text-secondary whitespace-pre-wrap">
            {bot.welcome_message || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-text-primary">System prompt</dt>
          <dd className="mt-1 text-base leading-relaxed text-text-secondary whitespace-pre-wrap">
            {bot.system_prompt || "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <Button href="/bots" variant="secondary">
          Back to bots
        </Button>
      </div>
    </div>
  );
}
