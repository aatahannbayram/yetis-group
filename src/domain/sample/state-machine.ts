export type SampleRequestStatus =
  | "TALEP_EDILDI"
  | "INCELENIYOR"
  | "ONAYLANDI"
  | "REDDEDILDI"
  | "HAZIRLANIYOR"
  | "SEVK_EDILDI"
  | "TESLIM_EDILDI"
  | "IPTAL";

/**
 * Single source of allowed sample-request status transitions (mirrors order FSM).
 * IPTAL is only reachable pre-ONAYLANDI — "bayi sadece Onaylandı öncesi iptal edebilir".
 */
export const SAMPLE_REQUEST_TRANSITIONS: ReadonlyArray<
  readonly [SampleRequestStatus, SampleRequestStatus]
> = [
  ["TALEP_EDILDI", "INCELENIYOR"],
  ["TALEP_EDILDI", "IPTAL"],
  ["INCELENIYOR", "ONAYLANDI"],
  ["INCELENIYOR", "REDDEDILDI"],
  ["INCELENIYOR", "IPTAL"],
  ["ONAYLANDI", "HAZIRLANIYOR"],
  ["HAZIRLANIYOR", "SEVK_EDILDI"],
  ["SEVK_EDILDI", "TESLIM_EDILDI"],
] as const;

const transitionSet = new Set(
  SAMPLE_REQUEST_TRANSITIONS.map(([from, to]) => `${from}->${to}`),
);

export class SampleTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SampleTransitionError";
  }
}

export type SampleTransitionInput = {
  from: SampleRequestStatus;
  to: SampleRequestStatus;
  rejectReason?: string | null;
};

export type SampleTransitionResult =
  | { ok: true; rejectReason?: string }
  | { ok: false; error: SampleTransitionError };

/** Pure guard for a status change. REDDEDILDI requires a reason. */
export function assertSampleTransition(input: SampleTransitionInput): SampleTransitionResult {
  if (input.from === input.to) {
    return { ok: true };
  }

  if (!transitionSet.has(`${input.from}->${input.to}`)) {
    return {
      ok: false,
      error: new SampleTransitionError(`${input.from} → ${input.to} geçişine izin verilmiyor.`),
    };
  }

  if (input.to === "REDDEDILDI") {
    const reason = input.rejectReason?.trim();
    if (!reason) {
      return {
        ok: false,
        error: new SampleTransitionError("Red nedeni REDDEDILDI geçişinde zorunludur."),
      };
    }
    return { ok: true, rejectReason: reason };
  }

  return { ok: true };
}

export function isSampleTransitionAllowed(
  from: SampleRequestStatus,
  to: SampleRequestStatus,
): boolean {
  if (from === to) return true;
  return transitionSet.has(`${from}->${to}`);
}

export function nextSampleStatuses(status: SampleRequestStatus): SampleRequestStatus[] {
  return SAMPLE_REQUEST_TRANSITIONS.filter(([from]) => from === status).map(([, to]) => to);
}

export type SampleStockEffect = "consume" | "none";

/**
 * No separate sample-stock pool: consumption is a normal FIRE StockMovement
 * against the FEFO-picked Lot, written at ship time (not at approval) —
 * mirrors how the order FSM only reserves stock at CONFIRMED, not SUBMITTED,
 * so an approved-but-not-yet-shipped request never locks stock it might not use.
 */
export function sampleStockEffectOnTransition(
  from: SampleRequestStatus,
  to: SampleRequestStatus,
): SampleStockEffect {
  if (from === to) return "none";
  if (to === "SEVK_EDILDI") return "consume";
  return "none";
}
