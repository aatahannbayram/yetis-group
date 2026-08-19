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

export type OrderPaymentMethodLike = "HAVALE" | "CARI" | "ONLINE" | null;

/** Limit varsa kullanılabilir kuruş: max(0, limit - exposure). Limit yoksa null. */
export function availableCreditKurus(limitKurus: number | null, exposureKurus: number): number | null {
  if (limitKurus == null) return null;
  return Math.max(0, limitKurus - exposureKurus);
}

/**
 * Teslimatta BORC yazılsın mı?
 *
 * Havale: `confirmOrderPayment` ODEME yazar; teslimatta BORC beklenir
 * (`paidAt` dolu olsa da). Net: ödendiyse 0, değilse sipariş tutarı.
 * ONLINE mock `paidAt` set eder ama ODEME yazmaz; BORC çift borç olur, atlanır.
 */
export function shouldPostDeliveryDebt(input: {
  paymentMethod: OrderPaymentMethodLike;
  paidAt: Date | string | null;
}): boolean {
  if (input.paymentMethod === "ONLINE" && input.paidAt != null) return false;
  return true;
}

export type ProformaSettlementKind = "paid" | "open_account" | "unsent";

/** Proforma slide-over ödeme rozeti. e-Fatura değil. */
export function proformaSettlementBadge(input: {
  paymentMethod: OrderPaymentMethodLike;
  paidAt: Date | string | null;
  sentAt: Date | string | null;
  paymentTermDays?: number | null;
}): { kind: ProformaSettlementKind; label: string } | null {
  if (input.paidAt) return { kind: "paid", label: "Ödendi" };
  if (input.paymentMethod === "CARI") {
    const days = input.paymentTermDays;
    return {
      kind: "open_account",
      label: days != null ? `Cari açık · ${days} gün` : "Cari açık",
    };
  }
  if (!input.sentAt) return { kind: "unsent", label: "Gönderilmedi" };
  return null;
}

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
