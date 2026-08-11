import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { plans } from "@/lib/plans";

export function Pricing(): ReactNode {
  return (
    <section id="pricing" className="border-t border-border bg-surface-secondary/40">
      <div className="mx-auto max-w-[1120px] px-6 py-20 sm:py-24">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Simple plans that gate what matters
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
          Limits on bots, messages, storage, and widget branding. Checkout uses
          Stripe in test mode for this demo — no live charges.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col rounded-lg border bg-surface p-6 shadow-card ${
                plan.highlighted
                  ? "border-accent ring-1 ring-accent"
                  : "border-border"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold text-text-primary">
                  {plan.name}
                </h3>
                {plan.highlighted ? (
                  <span className="text-xs font-medium text-accent">
                    Recommended
                  </span>
                ) : null}
              </div>
              <p className="mt-4 font-display text-4xl font-semibold tracking-tight text-text-primary">
                {plan.priceLabel}
                {plan.id !== "free" ? (
                  <span className="text-base font-medium text-text-muted">
                    /mo
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-sm text-text-muted">{plan.priceNote}</p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm text-text-secondary">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  href="/signup"
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="w-full"
                >
                  {plan.ctaLabel}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
