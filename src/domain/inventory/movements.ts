import { add, compare, kg, subtract, zeroKg, type Kg } from "@/domain/weight";
import { InventoryError, assertNotExpired } from "@/domain/inventory/fefo";

export type StockMovementKind = "GIRIS" | "CIKIS" | "FIRE" | "REPACK";

export type StockMovementLike = {
  type: string;
  quantityKg: unknown;
};

/** GIRIS artırır; CIKIS ve FIRE azaltır. REPACK bakiyeye yazılmaz. */
export function availableKgFromMovements(movements: readonly StockMovementLike[]): Kg {
  return movements.reduce((total, movement) => {
    const quantity = kg(String(movement.quantityKg));
    if (movement.type === "GIRIS") return add(total, quantity);
    if (movement.type === "CIKIS" || movement.type === "FIRE") return subtract(total, quantity);
    return total;
  }, zeroKg);
}

export type RecordableMovementType = "GIRIS" | "CIKIS" | "FIRE";

export const STOCK_MOVEMENT_LABEL: Record<RecordableMovementType, string> = {
  GIRIS: "Giriş",
  CIKIS: "Çıkış",
  FIRE: "Fire",
};

export type RecordMovementInput = {
  type: RecordableMovementType;
  quantityKg: number;
  note?: string | null;
  lotNumber: string;
  availableKg: Kg;
  expirationDate: Date;
  asOf?: Date;
};

/**
 * Stok hareketi kaydı: CIKIS SKT geçmişte yasak; FIRE not zorunlu ve SKT geçmişte serbest.
 */
export function assertCanRecordMovement(input: RecordMovementInput): void {
  if (!Number.isFinite(input.quantityKg) || input.quantityKg <= 0) {
    throw new InventoryError("Geçerli bir miktar (kg) girin.");
  }

  const qty = kg(input.quantityKg);

  if (input.type === "CIKIS") {
    assertNotExpired(
      { lotNumber: input.lotNumber, expirationDate: input.expirationDate },
      input.asOf,
    );
  }

  if (input.type === "FIRE") {
    const note = input.note?.trim() ?? "";
    if (note.length < 3) {
      throw new InventoryError("Fire için neden yazın (imha, iade üretici veya numune).");
    }
  }

  if (input.type === "CIKIS" || input.type === "FIRE") {
    if (compare(input.availableKg, qty) < 0) {
      throw new InventoryError(
        `${input.lotNumber} lotunda yeterli stok yok (mevcut: ${input.availableKg.toString()} kg).`,
      );
    }
  }
}
