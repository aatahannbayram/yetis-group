export type SampleLimitSettingsLike = {
  maxRequestsPerDealerPerMonth: number;
  maxValueKurusPerDealerPerMonth: number;
  maxQtyPerProduct: number;
  repeatBlockDays: number;
};

export type SampleLimitViolation =
  | { rule: "monthly_count"; limit: number; current: number }
  | { rule: "monthly_value"; limitKurus: number; currentKurus: number }
  | { rule: "product_qty"; variantId: string; limit: number; requested: number }
  | { rule: "repeat_request"; variantId: string; lastRequestedAt: Date; blockDays: number };

export type EvaluateSampleRequestInput = {
  settings: SampleLimitSettingsLike;
  /** Existing requests this dealer already made this calendar month, before this one. */
  monthlyRequestCount: number;
  /** Total estimated cost (kuruş) of this dealer's requests so far this month, before this one. */
  monthlyValueKurus: number;
  /** Lines being requested now. */
  requestedItems: readonly { variantId: string; quantity: number; unitCostKurus?: number }[];
  /** Most recent prior request date per variant, within the lookback window the caller queried. */
  recentRequestsByVariant: ReadonlyMap<string, Date>;
  now?: Date;
};

export type SampleLimitEvaluation =
  | { ok: true; violations: [] }
  | { ok: true; violations: SampleLimitViolation[]; flagForReview: true };

/**
 * Per the brief: limit rules never block submission — they only flag the
 * request for review. Callers use `violations.length > 0` to decide whether
 * to set flaggedForReview/status = INCELENIYOR instead of the default status.
 */
export function evaluateSampleRequestAgainstLimits(
  input: EvaluateSampleRequestInput,
): SampleLimitEvaluation {
  const violations: SampleLimitViolation[] = [];
  const { settings } = input;
  const now = input.now ?? new Date();

  if (input.monthlyRequestCount + 1 > settings.maxRequestsPerDealerPerMonth) {
    violations.push({
      rule: "monthly_count",
      limit: settings.maxRequestsPerDealerPerMonth,
      current: input.monthlyRequestCount + 1,
    });
  }

  const requestedValueKurus = input.requestedItems.reduce(
    (sum, item) => sum + (item.unitCostKurus ?? 0) * item.quantity,
    0,
  );
  const projectedValueKurus = input.monthlyValueKurus + requestedValueKurus;
  if (projectedValueKurus > settings.maxValueKurusPerDealerPerMonth) {
    violations.push({
      rule: "monthly_value",
      limitKurus: settings.maxValueKurusPerDealerPerMonth,
      currentKurus: projectedValueKurus,
    });
  }

  for (const item of input.requestedItems) {
    if (item.quantity > settings.maxQtyPerProduct) {
      violations.push({
        rule: "product_qty",
        variantId: item.variantId,
        limit: settings.maxQtyPerProduct,
        requested: item.quantity,
      });
    }

    const lastRequestedAt = input.recentRequestsByVariant.get(item.variantId);
    if (lastRequestedAt) {
      const elapsedDays = Math.floor(
        (now.getTime() - lastRequestedAt.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (elapsedDays < settings.repeatBlockDays) {
        violations.push({
          rule: "repeat_request",
          variantId: item.variantId,
          lastRequestedAt,
          blockDays: settings.repeatBlockDays,
        });
      }
    }
  }

  if (violations.length === 0) {
    return { ok: true, violations: [] };
  }
  return { ok: true, violations, flagForReview: true };
}
