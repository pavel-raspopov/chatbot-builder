import type { ReactNode } from "react";

export default function BillingPage(): ReactNode {
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
        Billing
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Coming next — manage your plan and Stripe checkout here.
      </p>
    </div>
  );
}
