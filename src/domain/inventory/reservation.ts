import { subtract, type Kg } from "@/domain/weight";
import { suggestFefoShipment, type LotSummary } from "@/domain/inventory/fefo";

export type OrderLineDemand = {
  orderLineId: string;
  variantId: string;
  requiredKg: Kg;
};

export type OrderStockAllocation = {
  orderLineId: string;
  variantId: string;
  lotId: string;
  lotNumber: string;
  quantityKg: Kg;
};

/**
 * Allocates FEFO lots across order lines. Lines that share a variant consume
 * the same remaining pool so two rows cannot both take the last available kg.
 */
export function allocateOrderLinesFefo(
  lotsByVariant: ReadonlyMap<string, readonly LotSummary[]>,
  lines: readonly OrderLineDemand[],
  asOf: Date = new Date(),
): OrderStockAllocation[] {
  const remaining = new Map<string, LotSummary[]>();
  for (const [variantId, lots] of lotsByVariant) {
    remaining.set(
      variantId,
      lots.map((lot) => ({ ...lot })),
    );
  }

  const out: OrderStockAllocation[] = [];
  for (const line of lines) {
    const lots = remaining.get(line.variantId) ?? [];
    const picks = suggestFefoShipment(lots, line.requiredKg, asOf);
    for (const pick of picks) {
      out.push({
        orderLineId: line.orderLineId,
        variantId: line.variantId,
        lotId: pick.lotId,
        lotNumber: pick.lotNumber,
        quantityKg: pick.quantityKg,
      });
      const lot = lots.find((item) => item.id === pick.lotId);
      if (lot) {
        lot.availableKg = subtract(lot.availableKg, pick.quantityKg);
      }
    }
  }
  return out;
}
