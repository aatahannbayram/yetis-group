"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  Flame,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format/date";
import { createLotAction, addStockMovementAction } from "@/app/(panel)/panel/urunler/actions";
import {
  STOCK_MOVEMENT_LABEL,
  type RecordableMovementType,
} from "@/domain/inventory/movements";
import { cn } from "@/lib/utils";

type Movement = {
  id: string;
  type: RecordableMovementType | "REPACK";
  quantityKg: string;
  note: string | null;
  createdAt: string;
};

type LotItem = {
  id: string;
  lotNumber: string;
  expirationDate: string;
  expired: boolean;
  availableKg: string;
  movements: Movement[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function sktStatus(expirationDate: string, expired: boolean) {
  if (expired) return { tone: "danger" as const, icon: AlertTriangle, label: "Süresi geçti" };
  const days = Math.ceil((new Date(expirationDate).getTime() - Date.now()) / DAY_MS);
  if (days <= 14) {
    return { tone: "warning" as const, icon: CalendarClock, label: `SKT ${days} gün kaldı` };
  }
  return { tone: "success" as const, icon: CalendarClock, label: "SKT uygun" };
}

function MovementIcon({ type }: { type: string }) {
  if (type === "GIRIS") {
    return <ArrowDownCircle className="size-3.5 shrink-0 text-[var(--success-solid)]" aria-hidden />;
  }
  if (type === "FIRE") {
    return <Flame className="size-3.5 shrink-0 text-[var(--danger-solid,#c02626)]" aria-hidden />;
  }
  return <ArrowUpCircle className="size-3.5 shrink-0 text-[var(--warning-solid)]" aria-hidden />;
}

function NewLotForm({ variantId, slug }: { variantId: string; slug: string }) {
  const [lotNumber, setLotNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [initialKg, setInitialKg] = useState("");
  const [isPending, startTransition] = useTransition();
  const lotNumberId = `lotNumber-${variantId}`;
  const expirationId = `expirationDate-${variantId}`;
  const initialKgId = `initialKg-${variantId}`;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!lotNumber || !expirationDate || !initialKg) return;
    startTransition(async () => {
      await createLotAction(variantId, slug, {
        lotNumber,
        expirationDate,
        initialKg: Number(initialKg.replace(",", ".")),
      });
      setLotNumber("");
      setExpirationDate("");
      setInitialKg("");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
    >
      <div className="space-y-1.5">
        <Label htmlFor={lotNumberId}>Lot No</Label>
        <Input
          id={lotNumberId}
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          placeholder="L-2026-08-01"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={expirationId}>SKT</Label>
        <Input
          id={expirationId}
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={initialKgId}>Giriş Miktarı (kg)</Label>
      <Input
        id={initialKgId}
        inputMode="decimal"
        value={initialKg}
        onChange={(e) => setInitialKg(e.target.value)}
        placeholder="17,5"
        required
      />
      </div>
      <Button type="submit" disabled={isPending} className="gap-1.5">
        <Plus className="size-4" aria-hidden />
        Lot Ekle
      </Button>
    </form>
  );
}

function LotMovementForm({ lot, slug }: { lot: LotItem; slug: string }) {
  const onHand = Number(lot.availableKg);
  const [type, setType] = useState<RecordableMovementType>(
    lot.expired && onHand > 0 ? "FIRE" : "GIRIS",
  );
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!quantity) return;
    setError(null);
    startTransition(async () => {
      try {
        await addStockMovementAction(slug, {
          lotId: lot.id,
          type,
          quantityKg: Number(quantity.replace(",", ".")),
          note: note.trim() || undefined,
        });
        setQuantity("");
        setNote("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Hareket eklenemedi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <Select
        value={type}
        onValueChange={(v) => setType(v as RecordableMovementType)}
      >
        <SelectTrigger className="h-8 w-28 bg-[var(--surface)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GIRIS">Giriş</SelectItem>
          <SelectItem value="CIKIS" disabled={lot.expired}>
            Çıkış
          </SelectItem>
          <SelectItem value="FIRE">Fire</SelectItem>
        </SelectContent>
      </Select>
      <Input
        inputMode="decimal"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="kg"
        className="h-8 w-24 bg-[var(--surface)]"
        required
      />
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={type === "FIRE" ? "Neden zorunlu" : "Not (opsiyonel)"}
        className="h-8 min-w-[10rem] flex-1 bg-[var(--surface)]"
        required={type === "FIRE"}
        minLength={type === "FIRE" ? 3 : undefined}
      />
      <Button type="submit" size="sm" variant="secondary" disabled={isPending}>
        Kaydet
      </Button>
      {error ? <p className="w-full text-caption text-[var(--danger-text)]">{error}</p> : null}
    </form>
  );
}

export function LotManager({
  variantId,
  slug,
  lots,
}: {
  variantId: string;
  slug: string;
  lots: LotItem[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--panel-border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
        <h3 className="mb-3 flex items-center gap-1.5 text-body-sm font-semibold text-[var(--text-primary)]">
          <Plus className="size-4 text-[var(--primary-text)]" aria-hidden />
          Yeni Lot
        </h3>
        <NewLotForm variantId={variantId} slug={slug} />
      </div>

      <div className="flex flex-col gap-3">
        {lots.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-4 text-center text-body-sm text-[var(--text-muted)]">
            Henüz lot eklenmedi.
          </p>
        ) : (
          lots.map((lot) => {
            const skt = sktStatus(lot.expirationDate, lot.expired);
            const onHand = Number(lot.availableKg);
            return (
              <div
                key={lot.id}
                className="rounded-[var(--radius-card)] border border-[var(--panel-border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[var(--radius-sm)] bg-[var(--surface-3)] px-2 py-1 font-mono text-caption font-semibold text-[var(--text-primary)]">
                      {lot.lotNumber}
                    </span>
                    <StatusBadge
                      tone={skt.tone}
                      icon={skt.icon}
                      label={`${formatDate(new Date(lot.expirationDate))} · ${skt.label}`}
                    />
                  </div>
                  <p
                    className={cn(
                      "tabular-nums text-body font-semibold",
                      lot.expired
                        ? "text-[var(--danger-text,#b42318)]"
                        : "text-[var(--primary-text)]",
                    )}
                  >
                    {lot.availableKg}{" "}
                    <span className="text-caption font-normal text-[var(--text-muted)]">
                      {lot.expired
                        ? onHand > 0
                          ? "kg SKT geçmiş eldeki"
                          : "kg (düşüldü)"
                        : "kg sevk edilebilir"}
                    </span>
                  </p>
                </div>

                <div className="mt-3 border-t border-[var(--panel-border)] pt-3">
                  <LotMovementForm lot={lot} slug={slug} />
                </div>

                {lot.movements.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-2 border-t border-[var(--panel-border)] pt-3">
                    {lot.movements.slice(0, 5).map((movement) => (
                      <li key={movement.id} className="flex items-center gap-2 text-caption">
                        <MovementIcon type={movement.type} />
                        <span className="flex-1 tabular-nums text-[var(--text-secondary)]">
                          {movement.type === "GIRIS" ? "+" : "-"}
                          {movement.quantityKg} kg
                          {" · "}
                          {STOCK_MOVEMENT_LABEL[movement.type as RecordableMovementType] ??
                            movement.type}
                          {movement.note ? (
                            <span className="text-[var(--text-muted)]">
                              {" "}
                              &middot; {movement.note}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-[var(--text-muted)]">
                          {formatDate(new Date(movement.createdAt))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
