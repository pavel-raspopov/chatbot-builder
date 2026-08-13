import Link from "next/link";
import type { ReactNode } from "react";
import { DocumentUpload } from "@/components/bots/DocumentUpload";
import { DocumentsList } from "@/components/bots/DocumentsList";
import { EditBotForm } from "@/components/bots/EditBotForm";
import { Button } from "@/components/ui/Button";
import { getPlanLimits, normalizePlanId } from "@/lib/plans";
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

  const [documentsResult, profileResult, usageResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id, filename, byte_size, status, error, created_at")
      .eq("bot_id", bot.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
    supabase.from("documents").select("byte_size").eq("user_id", user.id),
  ]);

  if (documentsResult.error || profileResult.error || usageResult.error) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-text-secondary">
          <Link
            href="/bots"
            className="font-medium text-accent hover:text-accent-dark focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            Bots
          </Link>
          <span className="text-text-muted"> / {bot.name}</span>
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary">
          {bot.name}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-error" role="alert">
          Could not load documents. Refresh the page or try again shortly.
        </p>
      </div>
    );
  }

  const limits = getPlanLimits(normalizePlanId(profileResult.data?.plan));
  const usedBytes = (usageResult.data ?? []).reduce(
    (sum, row) => sum + (row.byte_size ?? 0),
    0,
  );
  const documents = documentsResult.data ?? [];

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-text-secondary">
        <Link
          href="/bots"
          className="font-medium text-accent hover:text-accent-dark focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          Bots
        </Link>
        <span className="text-text-muted"> / {bot.name}</span>
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary">
        {bot.name}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Edit how this bot greets people, then upload PDF, Markdown, or text.
        Files are indexed automatically after upload.
      </p>

      <EditBotForm
        botId={bot.id}
        name={bot.name}
        welcomeMessage={bot.welcome_message}
        systemPrompt={bot.system_prompt}
      />

      <section className="mt-10">
        <DocumentUpload
          botId={bot.id}
          usedBytes={usedBytes}
          maxStorageBytes={limits.maxStorageBytes}
        />
        <DocumentsList documents={documents} />
      </section>

      <div className="mt-8">
        <Button href="/bots" variant="secondary">
          Back to bots
        </Button>
      </div>
    </div>
  );
}
