"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { deleteBot } from "@/actions/bots";
import { Button } from "@/components/ui/Button";

export type BotListItem = {
  id: string;
  name: string;
  created_at: string;
};

export type BotsListProps = {
  bots: BotListItem[];
  atBotLimit: boolean;
  maxBots: number;
};

function formatCreatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BotsList({
  bots,
  atBotLimit,
  maxBots,
}: BotsListProps): ReactNode {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isEmpty = bots.length === 0;

  function handleDelete(botId: string): void {
    setError(null);
    setDeletingId(botId);
    startTransition(async () => {
      const result = await deleteBot(botId);
      setDeletingId(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bots
        </h1>
        {atBotLimit ? (
          <Button href="/settings/billing" variant="secondary">
            Upgrade
          </Button>
        ) : (
          <Button href="/bots/new" variant="primary">
            Create bot
          </Button>
        )}
      </div>

      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        {bots.length} / {maxBots} bots on your plan
      </p>

      {error ? (
        <p className="mt-4 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      {isEmpty ? (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            No bots yet
          </h2>
          <p className="mt-2 max-w-md text-base leading-relaxed text-text-secondary">
            Create a bot, then upload docs so it can answer from your knowledge
            base.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {atBotLimit ? (
              <Button href="/settings/billing" variant="primary">
                Upgrade to create a bot
              </Button>
            ) : (
              <Button href="/bots/new" variant="primary">
                Create bot
              </Button>
            )}
          </div>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {bots.map((bot) => {
            const created = formatCreatedAt(bot.created_at);
            const deleting = deletingId === bot.id && isPending;

            return (
              <li
                key={bot.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/bots/${bot.id}`}
                    className="font-medium text-text-primary hover:text-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {bot.name}
                  </Link>
                  {created ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      Created {created}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => handleDelete(bot.id)}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {!isEmpty && atBotLimit ? (
        <p className="mt-6 text-sm text-text-secondary">
          You&apos;ve reached your bot limit.{" "}
          <Link
            href="/settings/billing"
            className="font-medium text-accent hover:text-accent-dark focus:outline-none focus:ring-1 focus:ring-accent"
          >
            Upgrade
          </Link>{" "}
          to create more.
        </p>
      ) : null}
    </div>
  );
}
