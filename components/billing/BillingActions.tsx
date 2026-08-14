"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  startCheckout,
  startPortal,
  type BillingActionState,
} from "@/actions/billing";
import { Button } from "@/components/ui/Button";
import type { PlanId } from "@/lib/plans";

const initialState: BillingActionState = { error: null };

type BillingActionsProps = {
  planId: PlanId;
  hasSubscription: boolean;
  hasCustomer: boolean;
};

export function BillingActions({
  planId,
  hasSubscription,
  hasCustomer,
}: BillingActionsProps): ReactNode {
  const [checkoutState, checkoutAction, checkoutPending] = useActionState(
    startCheckout,
    initialState,
  );
  const [portalState, portalAction, portalPending] = useActionState(
    startPortal,
    initialState,
  );

  const error = checkoutState.error ?? portalState.error;
  const busy = checkoutPending || portalPending;

  return (
    <div className="mt-8 flex flex-col gap-4">
      {planId === "free" && !hasSubscription ? (
        <div className="flex flex-wrap gap-3">
          <form action={checkoutAction}>
            <input type="hidden" name="plan" value="pro" />
            <Button type="submit" disabled={busy}>
              {checkoutPending ? "Redirecting…" : "Upgrade to Pro"}
            </Button>
          </form>
          <form action={checkoutAction}>
            <input type="hidden" name="plan" value="business" />
            <Button type="submit" variant="secondary" disabled={busy}>
              {checkoutPending ? "Redirecting…" : "Upgrade to Business"}
            </Button>
          </form>
        </div>
      ) : null}

      {hasCustomer ? (
        <form action={portalAction}>
          <Button
            type="submit"
            variant={planId === "free" ? "secondary" : "primary"}
            disabled={busy}
          >
            {portalPending ? "Redirecting…" : "Manage subscription"}
          </Button>
        </form>
      ) : null}

      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
