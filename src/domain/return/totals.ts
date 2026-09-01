export function formatReturnRequestNumber(year: number, seq: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`Geçersiz yıl: ${year}`);
  }
  if (!Number.isInteger(seq) || seq < 1) {
    throw new Error(`Geçersiz sıra: ${seq}`);
  }
  return `IAD-${year}-${String(seq).padStart(5, "0")}`;
}
