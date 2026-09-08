/**
 * Single source of truth for Viva's pricing.
 *
 * Model: one-time credit packs (no subscription). 1 credit = 1 full resume
 * analysis. AI mock interviews - voice and text - are free and unlimited for
 * everyone and never consume credits.
 *
 * Used by the landing pricing section, the in-app billing page, the
 * out-of-credits modal, and the server-side payment verifier.
 */

export type CreditPackId = "starter" | "pro" | "career";

export interface CreditPack {
  id: CreditPackId;
  name: string;
  /** Price in whole US dollars. */
  priceUsd: number;
  credits: number;
  description: string;
  popular: boolean;
  features: string[];
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    priceUsd: 19,
    credits: 5,
    description: "Enough to tailor your resume for a handful of roles.",
    popular: false,
    features: [
      "5 resume analyses",
      "ATS match score + keyword gaps",
      "AI rewrite suggestions",
      "PDF export",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 39,
    credits: 15,
    description: "Built for an active job search across many roles.",
    popular: true,
    features: [
      "15 resume analyses",
      "Everything in Starter",
      "Cover letter generator",
      "Saved reports + version history",
      "Priority email support",
    ],
  },
  {
    id: "career",
    name: "Career",
    priceUsd: 79,
    credits: 40,
    description: "For a full job-search season and career pivots.",
    popular: false,
    features: [
      "40 resume analyses",
      "Everything in Pro",
      "Best price per analysis",
      "Credits never expire",
    ],
  },
];

export function packById(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

/** Price in cents - the unit payment processors expect. */
export function centsFor(pack: CreditPack): number {
  return pack.priceUsd * 100;
}

/**
 * Authoritative cents → credits map for server-side verification.
 * Never trust the client to say how many credits a payment is worth.
 */
export const CREDITS_BY_CENTS: Record<number, number> = Object.fromEntries(
  CREDIT_PACKS.map((p) => [centsFor(p), p.credits]),
);
