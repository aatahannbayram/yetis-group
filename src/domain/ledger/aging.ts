/** Vade: teslim (BORC.createdAt) + paymentTermDays. Ledger'da dueDate yok. */

export type AgingBucket = "ok" | "warn" | "danger";

export type AgingEntryLike = {
  id: string;
  type: "BORC" | "ODEME";
  amountKurus: number;
  createdAt: Date | string;
  reversesId: string | null;
};

export type OpenDebtSlice = {
  remainingKurus: number;
  createdAt: Date;
  dueAt: Date;
  daysOverdue: number;
  bucket: AgingBucket;
};

export type DealerAging =
  | { kind: "clear" }
  | {
      kind: "open";
      daysOverdue: number;
      bucket: AgingBucket;
      oldestUnpaidAt: Date;
      dueAt: Date;
    };

const DAY_MS = 24 * 60 * 60 * 1000;

export function utcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function calendarDaysBetween(from: Date, to: Date): number {
  return Math.floor((utcDay(to) - utcDay(from)) / DAY_MS);
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

export function bucketFromOverdueDays(daysOverdue: number): AgingBucket {
  if (daysOverdue <= 30) return "ok";
  if (daysOverdue <= 45) return "warn";
  return "danger";
}

export const AGING_BUCKET_LABEL: Record<AgingBucket, string> = {
  ok: "0-30 gün",
  warn: "31-45 gün",
  danger: "46+ gün",
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Ters kayıt çiftlerini (orijinal + revers) aging'den çıkar. */
export function liveLedgerEntries<T extends AgingEntryLike>(entries: readonly T[]): T[] {
  const reversedIds = new Set(
    entries.filter((e) => e.reversesId).map((e) => e.reversesId as string),
  );
  const reversalIds = new Set(entries.filter((e) => e.reversesId).map((e) => e.id));
  return entries.filter((e) => !reversedIds.has(e.id) && !reversalIds.has(e.id));
}

/**
 * FIFO: ODEME en eski açık BORC'u kapatır. Kalan dilimler vade gecikmesine göre bucket alır.
 */
export function openDebtSlices(
  entries: readonly AgingEntryLike[],
  paymentTermDays: number | null,
  asOf: Date = new Date(),
): OpenDebtSlice[] {
  const termDays = paymentTermDays != null && paymentTermDays > 0 ? paymentTermDays : 0;
  const live = liveLedgerEntries(entries).slice().sort((a, b) => {
    const da = toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime();
    if (da !== 0) return da;
    return a.id.localeCompare(b.id);
  });

  const open: { createdAt: Date; remaining: number }[] = [];
  for (const entry of live) {
    if (entry.type === "BORC") {
      open.push({ createdAt: toDate(entry.createdAt), remaining: entry.amountKurus });
      continue;
    }
    let pay = entry.amountKurus;
    while (pay > 0 && open.length > 0) {
      const head = open[0]!;
      const take = Math.min(head.remaining, pay);
      head.remaining -= take;
      pay -= take;
      if (head.remaining <= 0) open.shift();
    }
  }

  return open
    .filter((row) => row.remaining > 0)
    .map((row) => {
      const dueAt = addUtcDays(row.createdAt, termDays);
      const daysOverdue = Math.max(0, calendarDaysBetween(dueAt, asOf));
      return {
        remainingKurus: row.remaining,
        createdAt: row.createdAt,
        dueAt,
        daysOverdue,
        bucket: bucketFromOverdueDays(daysOverdue),
      };
    });
}

export function dealerAging(
  input: {
    entries: readonly AgingEntryLike[];
    paymentTermDays: number | null;
    balanceKurus: number;
  },
  asOf: Date = new Date(),
): DealerAging {
  if (input.balanceKurus <= 0) return { kind: "clear" };
  const slices = openDebtSlices(input.entries, input.paymentTermDays, asOf);
  if (slices.length === 0) return { kind: "clear" };
  const oldest = slices.reduce((a, b) => (a.daysOverdue >= b.daysOverdue ? a : b));
  return {
    kind: "open",
    daysOverdue: oldest.daysOverdue,
    bucket: oldest.bucket,
    oldestUnpaidAt: oldest.createdAt,
    dueAt: oldest.dueAt,
  };
}

export type AgingPortfolio = {
  okKurus: number;
  warnKurus: number;
  dangerKurus: number;
  okCount: number;
  warnCount: number;
  dangerCount: number;
};

export function summarizeAgingPortfolio(
  dealers: readonly {
    entries: readonly AgingEntryLike[];
    paymentTermDays: number | null;
    balanceKurus: number;
  }[],
  asOf: Date = new Date(),
): AgingPortfolio {
  const out: AgingPortfolio = {
    okKurus: 0,
    warnKurus: 0,
    dangerKurus: 0,
    okCount: 0,
    warnCount: 0,
    dangerCount: 0,
  };

  for (const dealer of dealers) {
    const slices = openDebtSlices(dealer.entries, dealer.paymentTermDays, asOf);
    for (const slice of slices) {
      if (slice.bucket === "ok") out.okKurus += slice.remainingKurus;
      else if (slice.bucket === "warn") out.warnKurus += slice.remainingKurus;
      else out.dangerKurus += slice.remainingKurus;
    }
    const aging = dealerAging(dealer, asOf);
    if (aging.kind === "open") {
      if (aging.bucket === "ok") out.okCount += 1;
      else if (aging.bucket === "warn") out.warnCount += 1;
      else out.dangerCount += 1;
    }
  }

  return out;
}
