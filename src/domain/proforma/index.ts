import { computeInvoiceTotals, type InvoiceLineInput, type InvoiceTotals } from "@/domain/invoicing/totals";

export type ProformaLineInput = InvoiceLineInput & { description: string };
export type ProformaTotals = InvoiceTotals;

/** @deprecated Use computeInvoiceTotals from @/domain/invoicing/totals directly. */
export function computeProformaTotals(lines: readonly ProformaLineInput[]): ProformaTotals {
  return computeInvoiceTotals(lines);
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
