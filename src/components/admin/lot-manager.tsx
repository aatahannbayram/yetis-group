"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
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

type Movement = {
  id: string;
  type: "GIRIS" | "CIKIS";
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

function NewLotForm({ variantId, slug }: { variantId: string; slug: string }) {
  const [lotNumber, setLotNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [initialKg, setInitialKg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!lotNumber || !expirationDate || !initialKg) return;
    startTransition(async () => {
      await createLotAction(variantId, slug, {
        lotNumber,
        expirationDate,
        initialKg: Number(initialKg),
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
        <Label htmlFor="lotNumber">Lot No</Label>
        <Input
          id="lotNumber"
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          placeholder="L-2026-08-01"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="expirationDate">SKT</Label>
        <Input
          id="expirationDate"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="initialKg">Giriş Miktarı (kg)</Label>
        <Input
          id="initialKg"
          type="number"
          step="0.001"
          min="0"
          value={initialKg}
          onChange={(e) => setInitialKg(e.target.value)}
          placeholder="0.000"
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
  const [type, setType] = useState<"GIRIS" | "CIKIS">("GIRIS");
  const [quantity, setQuantity] = useState("");
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
          quantityKg: Number(quantity),
        });
        setQuantity("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Hareket eklenemedi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <Select value={type} onValueChange={(v) => setType(v as "GIRIS" | "CIKIS")}>
        <SelectTrigger className="h-8 w-28 bg-[var(--surface)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GIRIS">Giriş</SelectItem>
          <SelectItem value="CIKIS" disabled={lot.expired}>
            Çıkış
          </SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="number"
        step="0.001"
        min="0"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="kg"
        className="h-8 w-24 bg-[var(--surface)]"
        required
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
                  <p className="tabular-nums text-body font-semibold text-[var(--primary-text)]">
                    {lot.availableKg}{" "}
                    <span className="text-caption font-normal text-[var(--text-muted)]">kg mevcut</span>
                  </p>
                </div>

                <div className="mt-3 border-t border-[var(--panel-border)] pt-3">
                  <LotMovementForm lot={lot} slug={slug} />
                </div>

                {lot.movements.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-2 border-t border-[var(--panel-border)] pt-3">
                    {lot.movements.slice(0, 5).map((movement) => (
                      <li key={movement.id} className="flex items-center gap-2 text-caption">
                        {movement.type === "GIRIS" ? (
                          <ArrowDownCircle
                            className="size-3.5 shrink-0 text-[var(--success-solid)]"
                            aria-hidden
                          />
                        ) : (
                          <ArrowUpCircle
                            className="size-3.5 shrink-0 text-[var(--warning-solid)]"
                            aria-hidden
                          />
                        )}
                        <span className="flex-1 tabular-nums text-[var(--text-secondary)]">
                          {movement.type === "GIRIS" ? "+" : "-"}
                          {movement.quantityKg} kg
                          {movement.note ? (
                            <span className="text-[var(--text-muted)]"> &middot; {movement.note}</span>
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
