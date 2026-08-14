export type PlanId = 'free' | 'pro' | 'business';

export type Plan = {
  id: PlanId;
  name: string;
  priceLabel: string;
  priceNote: string;
  highlighted: boolean;
  features: string[];
  ctaLabel: string;
};

export type PlanLimits = {
  maxBots: number;
  maxMessagesPerMonth: number;
  maxStorageBytes: number;
};

const MB = 1024 * 1024;
const GB = 1024 * MB;

export const planLimits: Record<PlanId, PlanLimits> = {
  free: {
    maxBots: 1,
    maxMessagesPerMonth: 100,
    maxStorageBytes: 10 * MB,
  },
  pro: {
    maxBots: 5,
    maxMessagesPerMonth: 2_000,
    maxStorageBytes: 200 * MB,
  },
  business: {
    maxBots: 20,
    maxMessagesPerMonth: 10_000,
    maxStorageBytes: 1 * GB,
  },
};

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceLabel: '$0',
    priceNote: 'Forever free to try',
    highlighted: false,
    features: [
      '1 bot',
      '100 messages / month',
      '10 MB doc storage',
      'Widget shows DocuChat badge',
    ],
    ctaLabel: 'Start free',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '$29',
    priceNote: 'per month · Stripe test mode',
    highlighted: true,
    features: [
      '5 bots',
      '2,000 messages / month',
      '200 MB doc storage',
      'Remove widget branding',
    ],
    ctaLabel: 'Start with Pro',
  },
  {
    id: 'business',
    name: 'Business',
    priceLabel: '$99',
    priceNote: 'per month · Stripe test mode',
    highlighted: false,
    features: [
      '20 bots',
      '10,000 messages / month',
      '1 GB doc storage',
      'Remove widget branding',
      'Higher rate limits',
    ],
    ctaLabel: 'Start with Business',
  },
];

function isPlanId(value: string): value is PlanId {
  return value === 'free' || value === 'pro' || value === 'business';
}

/** Resolve a plan id string; unknown values fall back to free. */
export function normalizePlanId(value: string | null | undefined): PlanId {
  if (value && isPlanId(value)) {
    return value;
  }
  return 'free';
}

export function getPlan(id: string | null | undefined): Plan {
  const planId = normalizePlanId(id);
  const plan = plans.find((entry) => entry.id === planId);
  return plan ?? plans[0];
}

export function getPlanLimits(id: string | null | undefined): PlanLimits {
  return planLimits[normalizePlanId(id)];
}

/** Paid plans may hide the widget “Powered by DocuChat” badge. */
export function canRemoveBranding(id: string | null | undefined): boolean {
  const planId = normalizePlanId(id);
  return planId === 'pro' || planId === 'business';
}
