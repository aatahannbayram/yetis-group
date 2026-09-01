export class ReturnQuantityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReturnQuantityError";
  }
}

/**
 * Faturadaki adetten fazla iade girilemesin; kısmi iadeler (daha önce iade
 * edilmiş adet) düşülsün. Throws if the request would exceed what's left.
 */
export function assertReturnQtyWithinInvoice(input: {
  orderLineQty: number;
  previouslyReturnedQty: number;
  requestedQty: number;
}): void {
  const remaining = input.orderLineQty - input.previouslyReturnedQty;
  if (input.requestedQty > remaining) {
    throw new ReturnQuantityError(
      `Bu kalemde en fazla ${remaining} adet iade edilebilir (faturada ${input.orderLineQty}, daha önce ${input.previouslyReturnedQty} iade edilmiş).`,
    );
  }
  if (input.requestedQty <= 0) {
    throw new ReturnQuantityError("Geçerli bir iade adedi girin.");
  }
}

/** Warn-only (per brief: "uyarı verilsin") — never throws. */
export function assertWithinReturnWindow(
  orderDeliveredAt: Date,
  returnWindowDays: number,
  asOf: Date = new Date(),
): { withinWindow: boolean; daysSinceDelivery: number } {
  const daysSinceDelivery = Math.floor(
    (asOf.getTime() - orderDeliveredAt.getTime()) / (24 * 60 * 60 * 1000),
  );
  return { withinWindow: daysSinceDelivery <= returnWindowDays, daysSinceDelivery };
}

/**
 * Depo kabul miktarı bayinin beyanından (approvedQty) farklıysa uyarı — never
 * blocks (brief: "sistem uyarsın", not "engellensin"); faturalama depo kabul
 * miktarı üzerinden yapılır (acceptedGoodQty + acceptedDamagedQty), beyan değil.
 */
export function warehouseAcceptDiffersFromApproved(input: {
  approvedQty: number;
  acceptedGoodQty: number;
  acceptedDamagedQty: number;
}): boolean {
  return input.acceptedGoodQty + input.acceptedDamagedQty !== input.approvedQty;
}
