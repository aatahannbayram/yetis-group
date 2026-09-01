export type ConversionCandidateOrder = {
  orderId: string;
  variantId: string;
  createdAt: Date;
};

export type SampleConversionMatch = {
  orderId: string;
  daysElapsed: number;
};

/**
 * A sample "converts" if the same variant was ordered within `windowDays` of
 * the sample being delivered. Ties (multiple qualifying orders) resolve to
 * the earliest order — the first purchase after the sample, not the largest.
 */
export function matchSampleConversion(
  sample: { variantId: string; deliveredAt: Date },
  candidateOrders: readonly ConversionCandidateOrder[],
  windowDays: number,
): SampleConversionMatch | null {
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const eligible = candidateOrders
    .filter((o) => o.variantId === sample.variantId)
    .filter((o) => o.createdAt.getTime() >= sample.deliveredAt.getTime())
    .filter((o) => o.createdAt.getTime() - sample.deliveredAt.getTime() <= windowMs)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const first = eligible[0];
  if (!first) return null;

  const daysElapsed = Math.floor(
    (first.createdAt.getTime() - sample.deliveredAt.getTime()) / (24 * 60 * 60 * 1000),
  );
  return { orderId: first.orderId, daysElapsed };
}
