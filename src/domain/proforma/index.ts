import { money, type Money } from "@/domain/money";

export type ProformaLineInput = {
  description: string;
  quantity: number;
  unitPriceKurus: number;
  /** e.g. 100 = %1, 1000 = %10, 2000 = %20 */
  vatRateBasisPoints: number;
  /** Gross line total (VAT-inclusive) as stored on order lines today */
  lineTotalKurus: number;
};

export type ProformaTotals = {
  subtotalKurus: Money;
  vatKurus: Money;
  totalKurus: Money;
};

/**
 * Order line totals are VAT-inclusive (unit × qty).
 * Split into net + VAT using integer kuruş math (no float).
 */
export function computeProformaTotals(lines: readonly ProformaLineInput[]): ProformaTotals {
  let netSum = 0;
  let vatSum = 0;
  let grossSum = 0;

  for (const line of lines) {
    const gross = line.lineTotalKurus;
    const rate = line.vatRateBasisPoints;
    if (!Number.isInteger(gross) || gross < 0) {
      throw new Error(`Geçersiz satır tutarı: ${gross}`);
    }
    if (!Number.isInteger(rate) || rate < 0) {
      throw new Error(`Geçersiz KDV oranı: ${rate}`);
    }
    // net = gross * 10000 / (10000 + rate) — integer division
    const net = Math.floor((gross * 10000) / (10000 + rate));
    const vat = gross - net;
    netSum += net;
    vatSum += vat;
    grossSum += gross;
  }

  return {
    subtotalKurus: money(netSum),
    vatKurus: money(vatSum),
    totalKurus: money(grossSum),
  };
}

export function formatProformaNumber(year: number, seq: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`Geçersiz yıl: ${year}`);
  }
  if (!Number.isInteger(seq) || seq < 1) {
    throw new Error(`Geçersiz sıra: ${seq}`);
  }
  return `PRF-${year}-${String(seq).padStart(5, "0")}`;
}

export function canSendProforma(input: {
  status: "DRAFT" | "ISSUED" | "VOID";
  buyerEmail: string | null | undefined;
}): { ok: true } | { ok: false; reason: string } {
  if (input.status !== "ISSUED") {
    return { ok: false, reason: "Yalnızca düzenlenmiş proforma gönderilebilir." };
  }
  const email = input.buyerEmail?.trim();
  if (!email) {
    return { ok: false, reason: "Bayi e-posta adresi tanımlı değil." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, reason: "Bayi e-posta adresi geçersiz." };
  }
  return { ok: true };
}
