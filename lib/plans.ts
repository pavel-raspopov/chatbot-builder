export type PlanId = "free" | "pro" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  priceLabel: string;
  priceNote: string;
  highlighted: boolean;
  features: string[];
  ctaLabel: string;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    priceNote: "Forever free to try",
    highlighted: false,
    features: [
      "1 bot",
      "100 messages / month",
      "10 MB doc storage",
      "Widget shows DocuChat badge",
    ],
    ctaLabel: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$29",
    priceNote: "per month · Stripe test mode",
    highlighted: true,
    features: [
      "5 bots",
      "2,000 messages / month",
      "200 MB doc storage",
      "Remove widget branding",
    ],
    ctaLabel: "Start with Pro",
  },
  {
    id: "business",
    name: "Business",
    priceLabel: "$99",
    priceNote: "per month · Stripe test mode",
    highlighted: false,
    features: [
      "20 bots",
      "10,000 messages / month",
      "1 GB doc storage",
      "Remove widget branding",
      "Higher rate limits",
    ],
    ctaLabel: "Start with Business",
  },
];
