import type { Kg } from "@/domain/weight";

/** Kullanıcıya görünen stok yetersizliği; lot girilmemişse ayrı söyler. */
export function stockShortageMessage(input: {
  label: string;
  requestedKg: Kg;
  shippableKg: Kg;
}): string {
  const requested = input.requestedKg.toString();
  const available = input.shippableKg.toString();
  if (Number(available) <= 0) {
    return `${input.label} için stok girilmemiş. Panel → Stok üzerinden lot ve kg girin, sonra tekrar deneyin.`;
  }
  return `${input.label} için stok yetersiz (mevcut ${available} kg, istenen ${requested} kg).`;
}
