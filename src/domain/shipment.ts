export type ShipmentStatus = "HAZIRLANIYOR" | "YOLDA" | "TESLIM_EDILDI" | "IPTAL";

const TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  HAZIRLANIYOR: ["YOLDA", "IPTAL"],
  YOLDA: ["TESLIM_EDILDI", "IPTAL"],
  TESLIM_EDILDI: [],
  IPTAL: [],
};

export function nextShipmentStatuses(status: ShipmentStatus): ShipmentStatus[] {
  return TRANSITIONS[status];
}

export function canTransitionShipment(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
