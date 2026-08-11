import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function FinalCta(): ReactNode {
  return (
    <section className="border-t border-border bg-accent-muted">
      <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-6 px-6 py-20 sm:flex-row sm:items-center sm:justify-between sm:py-24">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
            Put your docs where questions land
          </h2>
          <p className="mt-3 text-base leading-relaxed text-text-secondary">
            Create a free bot, upload a few files, and see grounded answers
            before you embed anything.
          </p>
        </div>
        <Button href="/signup" variant="primary" className="shrink-0">
          Start free
        </Button>
      </div>
    </section>
  );
}
