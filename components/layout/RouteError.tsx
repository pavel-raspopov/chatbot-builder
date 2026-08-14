"use client";

import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function RouteError({ error, reset }: RouteErrorProps): ReactNode {
  useEffect(() => {
    console.error("[route]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
        Something went wrong
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Refresh the page or try again shortly.
      </p>
      <div className="mt-8">
        <Button type="button" variant="secondary" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
