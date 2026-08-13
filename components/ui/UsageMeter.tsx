import type { ReactNode } from "react";

type UsageMeterProps = {
  label: string;
  used: number;
  limit: number;
  valueLabel?: string;
};

export function UsageMeter({
  label,
  used,
  limit,
  valueLabel,
}: UsageMeterProps): ReactNode {
  const atLimit = used >= limit;
  const percent = Math.min(100, limit === 0 ? 100 : (used / limit) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p
          className={`text-sm tabular-nums ${atLimit ? "text-warning" : "text-text-secondary"}`}
        >
          {valueLabel ?? `${used} / ${limit}`}
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
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
