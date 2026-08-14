import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function RouteNotFound(): ReactNode {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
        Page not found
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        This page does not exist. Head back to the home page or your dashboard.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/" variant="primary">
          Home
        </Button>
        <Button href="/dashboard" variant="secondary">
          Dashboard
        </Button>
      </div>
    </div>
  );
}
