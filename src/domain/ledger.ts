export type LedgerEntryLike = { type: "BORC" | "ODEME"; amountKurus: number };

/** Bakiye asla saklanmaz - her zaman ledger'dan türetilir. Pozitif = bayi borçlu. */
export function calculateBalance(entries: LedgerEntryLike[]): number {
  return entries.reduce(
    (sum, e) => (e.type === "BORC" ? sum + e.amountKurus : sum - e.amountKurus),
    0,
  );
}
