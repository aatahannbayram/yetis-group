export type ReturnRequestStatus =
  | "OLUSTURULDU"
  | "INCELENIYOR"
  | "ONAYLANDI"
  | "REDDEDILDI"
  | "URUN_TESLIM_ALINDI"
  | "KONTROL_EDILDI"
  | "FATURALANDI"
  | "KAPANDI"
  | "IPTAL";

/** Single source of allowed return-request status transitions (mirrors order/sample FSM). */
export const RETURN_TRANSITIONS: ReadonlyArray<readonly [ReturnRequestStatus, ReturnRequestStatus]> = [
  ["OLUSTURULDU", "INCELENIYOR"],
  ["OLUSTURULDU", "IPTAL"],
  ["INCELENIYOR", "ONAYLANDI"],
  ["INCELENIYOR", "REDDEDILDI"],
  ["INCELENIYOR", "IPTAL"],
  ["ONAYLANDI", "URUN_TESLIM_ALINDI"],
  ["URUN_TESLIM_ALINDI", "KONTROL_EDILDI"],
  ["KONTROL_EDILDI", "FATURALANDI"],
  ["FATURALANDI", "KAPANDI"],
] as const;

const transitionSet = new Set(RETURN_TRANSITIONS.map(([from, to]) => `${from}->${to}`));

export class ReturnTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReturnTransitionError";
  }
}

export type ReturnTransitionInput = {
  from: ReturnRequestStatus;
  to: ReturnRequestStatus;
  rejectReason?: string | null;
};

export type ReturnTransitionResult =
  | { ok: true; rejectReason?: string }
  | { ok: false; error: ReturnTransitionError };

/** Pure guard for a status change. REDDEDILDI requires a reason. */
export function assertReturnTransition(input: ReturnTransitionInput): ReturnTransitionResult {
  if (input.from === input.to) {
    return { ok: true };
  }

  if (!transitionSet.has(`${input.from}->${input.to}`)) {
    return {
      ok: false,
      error: new ReturnTransitionError(`${input.from} → ${input.to} geçişine izin verilmiyor.`),
    };
  }

  if (input.to === "REDDEDILDI") {
    const reason = input.rejectReason?.trim();
    if (!reason) {
      return {
        ok: false,
        error: new ReturnTransitionError("Red nedeni REDDEDILDI geçişinde zorunludur."),
      };
    }
    return { ok: true, rejectReason: reason };
  }

  return { ok: true };
}

export function isReturnTransitionAllowed(from: ReturnRequestStatus, to: ReturnRequestStatus): boolean {
  if (from === to) return true;
  return transitionSet.has(`${from}->${to}`);
}

export function nextReturnStatuses(status: ReturnRequestStatus): ReturnRequestStatus[] {
  return RETURN_TRANSITIONS.filter(([from]) => from === status).map(([, to]) => to);
}

export type ReturnStockEffect = "split" | "none";

/**
 * The good/damaged stock split (sağlam → GIRIS, hasarlı → FIRE) happens only
 * at KONTROL_EDILDI, once staff has recorded the warehouse-accepted split —
 * never earlier, since acceptedGoodQty/acceptedDamagedQty aren't known before then.
 */
export function returnStockEffectOnTransition(
  from: ReturnRequestStatus,
  to: ReturnRequestStatus,
): ReturnStockEffect {
  if (from === to) return "none";
  if (to === "KONTROL_EDILDI") return "split";
  return "none";
}
