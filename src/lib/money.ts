export function usd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function bps(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 10_000);
}

export function requiredCoverageCents(mortgageCents: number) {
  return Math.ceil(mortgageCents * 1.35);
}

export function bufferPassed(coverageCents: number, mortgageCents: number) {
  return coverageCents >= requiredCoverageCents(mortgageCents);
}

/** Minimum payable band from a parametric schedule, or the quoted limit. */
export function minimumPayableCents(
  coverageCents: number,
  payoutSchedule: unknown,
): number {
  if (!payoutSchedule || typeof payoutSchedule !== "object") {
    return coverageCents;
  }
  const record = payoutSchedule as { bands?: Array<{ pct?: number; cents?: number }> };
  const bands = record.bands;
  if (!bands?.length) return coverageCents;
  const values = bands.map((band) => {
    if (typeof band.cents === "number") return band.cents;
    if (typeof band.pct === "number") return Math.round((coverageCents * band.pct) / 100);
    return coverageCents;
  });
  return Math.min(...values);
}

/**
 * The smallest stated coverage that clears the 35% buffer once the product's
 * payout schedule is applied — i.e. the number a carrier should actually type
 * into "Coverage (USD)", since the raw 135%-of-mortgage figure only clears
 * the buffer when every band pays out 100%.
 */
export function suggestedMinimumCoverageCents(
  mortgageCents: number,
  payoutSchedule: unknown,
): { coverageCents: number; achievable: boolean } {
  const required = requiredCoverageCents(mortgageCents);
  if (!payoutSchedule || typeof payoutSchedule !== "object") {
    return { coverageCents: required, achievable: true };
  }
  const record = payoutSchedule as { bands?: Array<{ pct?: number; cents?: number }> };
  const bands = record.bands;
  if (!bands?.length) return { coverageCents: required, achievable: true };

  let coverageCents = required;
  for (const band of bands) {
    if (typeof band.cents === "number") {
      if (band.cents < required) return { coverageCents: required, achievable: false };
    } else if (typeof band.pct === "number" && band.pct > 0) {
      coverageCents = Math.max(coverageCents, Math.ceil((required * 100) / band.pct));
    }
  }
  return { coverageCents, achievable: true };
}

export function platformFeeBps(premiumCents: number) {
  if (premiumCents <= 100_000) return 2000;
  if (premiumCents < 800_000) return 1500;
  return 1200;
}

export function platformFeeCents(premiumCents: number) {
  return Math.round((premiumCents * platformFeeBps(premiumCents)) / 10_000);
}

export function listingWindow(params: {
  now?: Date;
  ownerRequestedDays: number;
  quoteValidUntil: Date;
  topUpDays?: number;
}) {
  const now = params.now ?? new Date();
  const topUpDays = params.topUpDays ?? 7;
  const ownerEnd = new Date(now);
  ownerEnd.setDate(ownerEnd.getDate() + params.ownerRequestedDays);
  const quoteBound = new Date(params.quoteValidUntil);
  quoteBound.setDate(quoteBound.getDate() - topUpDays);
  return ownerEnd < quoteBound ? ownerEnd : quoteBound;
}

export function waterfall(params: {
  grossCents: number;
  mortgageCents: number;
  ownerContributionBps: number;
}) {
  const lenderCents = Math.min(Math.max(params.mortgageCents, 0), params.grossCents);
  const netCents = params.grossCents - lenderCents;
  const ownerCents = Math.round((netCents * params.ownerContributionBps) / 10_000);
  const funderPoolCents = netCents - ownerCents;
  return { lenderCents, netCents, ownerCents, funderPoolCents };
}

/**
 * Illustrative-only preview for a contributor deciding how much to put in:
 * their share of the total premium, and what they'd get back if the policy's
 * full stated coverage pays out, assuming the listing reaches full funding as
 * currently structured. Not a guarantee — real payouts depend on the actual
 * claim size and the final mix of contributors once funding completes.
 */
export function estimatedContributorPayout(params: {
  contributionCents: number;
  premiumTargetCents: number;
  ownerContributionCents: number;
  coverageCents: number;
  mortgageCents: number;
}) {
  const { contributionCents, premiumTargetCents, ownerContributionCents, coverageCents, mortgageCents } =
    params;
  const sharePct = premiumTargetCents > 0 ? (contributionCents / premiumTargetCents) * 100 : 0;
  const ownerBps = bps(ownerContributionCents, premiumTargetCents);
  const split = waterfall({ grossCents: coverageCents, mortgageCents, ownerContributionBps: ownerBps });
  const assumedFunderTotalCents = Math.max(premiumTargetCents - ownerContributionCents, 0);
  const estimatedPayoutCents =
    assumedFunderTotalCents > 0
      ? Math.round((split.funderPoolCents * contributionCents) / assumedFunderTotalCents)
      : 0;
  return { sharePct, estimatedPayoutCents };
}
