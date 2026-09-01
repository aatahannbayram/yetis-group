export function formatSampleRequestNumber(year: number, seq: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`Geçersiz yıl: ${year}`);
  }
  if (!Number.isInteger(seq) || seq < 1) {
    throw new Error(`Geçersiz sıra: ${seq}`);
  }
  return `NUM-${year}-${String(seq).padStart(5, "0")}`;
}

export function computeSampleItemCost(
  unitCostKurus: number | null | undefined,
  quantity: number,
): number {
  if (unitCostKurus == null) return 0;
  if (!Number.isInteger(unitCostKurus) || unitCostKurus < 0) {
    throw new Error(`Geçersiz birim maliyet: ${unitCostKurus}`);
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error(`Geçersiz adet: ${quantity}`);
  }
  return unitCostKurus * quantity;
}

export function computeRequestTotalCost(
  items: readonly { unitCostKurus?: number | null; quantity: number }[],
): number {
  return items.reduce((sum, item) => sum + computeSampleItemCost(item.unitCostKurus, item.quantity), 0);
}
