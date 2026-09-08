import { subtract, type Kg } from "@/domain/weight";
import { InventoryError, suggestFefoShipment, type LotSummary } from "@/domain/inventory/fefo";

export type OrderLineDemand = {
  orderLineId: string;
  variantId: string;
  requiredKg: Kg;
  label?: string;
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
    let picks;
    try {
      picks = suggestFefoShipment(lots, line.requiredKg, asOf);
    } catch (err) {
      if (err instanceof InventoryError) {
        const who = line.label?.trim() || line.variantId;
        throw new InventoryError(
          `${who}: stok girilmemiş veya yetersiz (${line.requiredKg.toString()} kg istendi). ${err.message}`,
        );
      }
      throw err;
    }
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
