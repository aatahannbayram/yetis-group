export type LedgerEntryLike = { type: "BORC" | "ODEME"; amountKurus: number };

/** Bakiye asla saklanmaz - her zaman ledger'dan türetilir. Pozitif = bayi borçlu. */
export function calculateBalance(entries: LedgerEntryLike[]): number {
  return entries.reduce(
    (sum, e) => (e.type === "BORC" ? sum + e.amountKurus : sum - e.amountKurus),
    0,
  );
}

export type DealerPaymentTerm = "VADELI" | "PESIN" | "HAVALE" | "KARMA" | null;

export type CreditEligibilityInput = {
  dealerPaymentMethod: DealerPaymentTerm;
  creditLimitKurus: number | null;
  /** Mevcut açık borç: teslim edilmiş siparişlerin ledger bakiyesi + henüz teslim edilmemiş cari siparişlerin toplamı. */
  exposureKurus: number;
  orderTotalKurus: number;
};

export type CreditEligibilityResult = { ok: true } | { ok: false; reason: string };

/**
 * Cari hesap (vadeli) ile sipariş verilebilir mi? Yalnızca staff'ın
 * VADELI/KARMA olarak işaretlediği ve bir kredi limiti tanımlanmış bayiler
 * uygundur; limit her zaman açıkça tanımlanmalıdır (boş limit = cari kapalı).
 */
export function canUseOnAccount(input: CreditEligibilityInput): CreditEligibilityResult {
  if (input.dealerPaymentMethod !== "VADELI" && input.dealerPaymentMethod !== "KARMA") {
    return { ok: false, reason: "Bu bayi için vadeli/cari hesap ödemesi tanımlı değil" };
  }
  if (input.creditLimitKurus == null || input.creditLimitKurus <= 0) {
    return { ok: false, reason: "Bayi için kredi limiti tanımlanmamış" };
  }
  if (input.exposureKurus + input.orderTotalKurus > input.creditLimitKurus) {
    return { ok: false, reason: "Sipariş, bayinin kullanılabilir kredi limitini aşıyor" };
  }
  return { ok: true };
}
