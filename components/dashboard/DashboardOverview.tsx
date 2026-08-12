import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export type DashboardOverviewProps = {
  email: string;
  planName: string;
  planId: string;
  botCount: number;
  maxBots: number;
  messagesUsed: number;
  maxMessages: number;
  showUpgrade: boolean;
};

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}): ReactNode {
  const atLimit = used >= limit;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p
          className={`text-sm tabular-nums ${atLimit ? "text-warning" : "text-text-secondary"}`}
        >
          {used} / {limit}
        </p>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-surface-secondary"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
      >
        <div
          className={`h-full rounded-sm ${atLimit ? "bg-warning" : "bg-accent"}`}
          style={{
            width: `${Math.min(100, limit === 0 ? 100 : (used / limit) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

export function DashboardOverview({
  email,
  planName,
  planId,
  botCount,
  maxBots,
  messagesUsed,
  maxMessages,
  showUpgrade,
}: DashboardOverviewProps): ReactNode {
  const isEmpty = botCount === 0;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <span className="inline-flex items-center rounded-md bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
          {planName}
        </span>
      </div>

      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Signed in as{" "}
        <span className="font-medium text-text-primary">{email}</span>
        {planId === "free" ? " · Free plan" : null}
      </p>

      <div className="mt-8 space-y-5">
        <UsageMeter label="Bots" used={botCount} limit={maxBots} />
        <UsageMeter
          label="Messages this month"
          used={messagesUsed}
          limit={maxMessages}
        />
      </div>

      {isEmpty ? (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            No bots yet
          </h2>
          <p className="mt-2 max-w-md text-base leading-relaxed text-text-secondary">
            Create your first bot to upload docs and start answering questions
            from your knowledge base.
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/bots/new" variant="primary">
          Create bot
        </Button>
        {showUpgrade ? (
          <Button href="/settings/billing" variant="secondary">
            Upgrade
          </Button>
        ) : null}
      </div>
    </div>
  );
}
