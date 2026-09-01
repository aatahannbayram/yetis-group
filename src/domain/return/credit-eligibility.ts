import type { ReturnReason } from "@/domain/return/reasons";

/**
 * Which accepted quantity gets credited to the dealer on the return invoice.
 * User decision (2026-09-01): YG-fault reasons credit both good AND damaged
 * accepted quantity (the damage isn't the dealer's doing); dealer-caused
 * reasons credit only the sağlam (good) quantity — the dealer eats the loss
 * on units it damaged/over-ordered.
 */
const YG_FAULT_REASONS: ReadonlySet<ReturnReason> = new Set([
  "HASARLI_GELDI",
  "YANLIS_URUN",
  "HATALI_URUN",
  "SKT_YAKIN_GECMIS",
]);

export function resolveCreditableQty(input: {
  reason: ReturnReason;
  acceptedGoodQty: number;
  acceptedDamagedQty: number;
}): number {
  if (YG_FAULT_REASONS.has(input.reason)) {
    return input.acceptedGoodQty + input.acceptedDamagedQty;
  }
  return input.acceptedGoodQty;
}
