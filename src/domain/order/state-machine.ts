export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

/**
 * Single source of allowed order status transitions (CLAUDE.md order FSM).
 * Do not scatter transition rules across UI or actions.
 */
export const ORDER_TRANSITIONS: ReadonlyArray<readonly [OrderStatus, OrderStatus]> = [
  ["DRAFT", "SUBMITTED"],
  ["DRAFT", "CANCELLED"],
  ["SUBMITTED", "UNDER_REVIEW"],
  ["SUBMITTED", "CANCELLED"],
  ["UNDER_REVIEW", "CONFIRMED"],
  ["UNDER_REVIEW", "REJECTED"],
  ["UNDER_REVIEW", "CANCELLED"],
  ["CONFIRMED", "PREPARING"],
  ["CONFIRMED", "CANCELLED"],
  ["PREPARING", "SHIPPED"],
  ["PREPARING", "CANCELLED"],
  ["SHIPPED", "DELIVERED"],
] as const;

const transitionSet = new Set(ORDER_TRANSITIONS.map(([from, to]) => `${from}->${to}`));

export class OrderTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderTransitionError";
  }
}

export type OrderTransitionInput = {
  from: OrderStatus;
  to: OrderStatus;
  cancelReason?: string | null;
};

export type OrderTransitionResult =
  | { ok: true; cancelReason?: string }
  | { ok: false; error: OrderTransitionError };

/** Pure guard for a status change. CANCELLED requires a reason ("kurallı"). */
export function assertOrderTransition(input: OrderTransitionInput): OrderTransitionResult {
  if (input.from === input.to) {
    return { ok: true };
  }

  if (!transitionSet.has(`${input.from}->${input.to}`)) {
    return {
      ok: false,
      error: new OrderTransitionError(`${input.from} → ${input.to} geçişine izin verilmiyor.`),
    };
  }

  if (input.to === "CANCELLED") {
    const reason = input.cancelReason?.trim();
    if (!reason) {
      return {
        ok: false,
        error: new OrderTransitionError("İptal nedeni CANCELLED geçişinde zorunludur."),
      };
    }
    return { ok: true, cancelReason: reason };
  }

  return { ok: true };
}

export function isOrderTransitionAllowed(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return transitionSet.has(`${from}->${to}`);
}

export function nextOrderStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS.filter(([from]) => from === status).map(([, to]) => to);
}

export type OrderStockEffect = "reserve" | "release" | "none";

/**
 * Stock is locked on CONFIRMED (FEFO CIKIS). Cancel from CONFIRMED or
 * PREPARING returns it (GIRIS). Shipment must not deduct a second time.
 */
export function stockEffectOnTransition(from: OrderStatus, to: OrderStatus): OrderStockEffect {
  if (from === to) return "none";
  if (to === "CONFIRMED") return "reserve";
  if (to === "CANCELLED" && (from === "CONFIRMED" || from === "PREPARING")) return "release";
  return "none";
}
