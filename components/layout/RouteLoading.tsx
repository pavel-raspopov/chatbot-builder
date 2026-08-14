import type { ReactNode } from "react";

export function RouteLoading(): ReactNode {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-base leading-relaxed text-text-secondary" role="status">
        Loading…
      </p>
    </div>
  );
}
