"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PackageCheck, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { kg, sum, type Kg } from "@/domain/weight";
import { suggestFefoShipment, InventoryError, type FefoAllocation } from "@/domain/inventory/fefo";

export type ShippingLot = {
  id: string;
  lotNumber: string;
  expirationDate: string;
  availableKg: string;
  expired: boolean;
  expiringSoon: boolean;
  daysUntilExpiry: number;
  fefoRank: number | null;
};

export type ShippingRow = {
  productId: string;
  productName: string;
  productSlug: string;
  categoryName: string;
  variantId: string;
  sku: string;
  packLabel: string;
  lots: ShippingLot[];
};

const kgFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 3 });
function formatKgValue(value: Kg) {
  return `${kgFormatter.format(value.toNumber())} kg`;
}

function LotChip({ lot }: { lot: ShippingLot }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-body-sm",
        lot.expired
          ? "border-danger-fg/30 bg-danger-bg"
          : lot.expiringSoon
            ? "border-warning-fg/30 bg-warning-bg"
            : "border-border/60",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {lot.fefoRank === 0 && !lot.expired ? (
          <Badge className="bg-brand-600 text-white shrink-0">Önce bu</Badge>
        ) : null}
        <span className="truncate font-mono text-caption text-neutral-600">{lot.lotNumber}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 tabular-nums text-caption">
        <span className="text-neutral-500">{formatKgValue(kg(lot.availableKg))}</span>
        <span
          className={cn(
            "font-medium",
            lot.expired ? "text-danger-fg" : lot.expiringSoon ? "text-warning-fg" : "text-neutral-400",
          )}
        >
          {lot.expired ? "SKT geçti" : `${lot.daysUntilExpiry} gün`}
        </span>
      </div>
    </div>
  );
}

function VariantCard({ row }: { row: ShippingRow }) {
  const [requiredKg, setRequiredKg] = useState("");
  const [result, setResult] = useState<
    { allocations: FefoAllocation[]; error: string | null } | null
  >(null);

  const shippableKg = sum(
    row.lots.filter((l) => !l.expired).map((l) => kg(l.availableKg)),
  );
  const expiredCount = row.lots.filter((l) => l.expired).length;
  const soonCount = row.lots.filter((l) => l.expiringSoon).length;

  function suggest() {
    const target = Number(requiredKg);
    if (!Number.isFinite(target) || target <= 0) return;
    try {
      const allocations = suggestFefoShipment(
        row.lots.map((l) => ({
          id: l.id,
          lotNumber: l.lotNumber,
          expirationDate: new Date(l.expirationDate),
          availableKg: kg(l.availableKg),
        })),
        kg(target),
      );
      setResult({ allocations, error: null });
    } catch (e) {
      setResult({ allocations: [], error: e instanceof InventoryError ? e.message : "Hata oluştu" });
    }
  }

  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-card p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-neutral-900">{row.productName}</p>
          <p className="text-caption text-muted-foreground">
            {row.packLabel} · {row.sku}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {expiredCount > 0 ? (
            <Badge variant="destructive" className="gap-1">
              <TriangleAlert className="size-3" />
              {expiredCount} SKT geçmiş
            </Badge>
          ) : null}
          {soonCount > 0 ? <Badge className="bg-warning-bg text-warning-fg">{soonCount} yaklaşan</Badge> : null}
        </div>
      </div>

      <p className="mt-3 tabular-nums text-h4 leading-h4 font-bold text-brand-700">
        {formatKgValue(shippableKg)}
        <span className="ml-1 text-caption font-normal text-muted-foreground">sevk edilebilir</span>
      </p>

      <div className="mt-4 space-y-1.5">
        {row.lots.map((lot) => (
          <LotChip key={lot.id} lot={lot} />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4">
        <Input
          value={requiredKg}
          onChange={(e) => setRequiredKg(e.target.value)}
          type="number"
          step="0.001"
          min="0"
          placeholder="Gereken kg"
          className="h-9"
        />
        <Button type="button" size="sm" onClick={suggest} className="shrink-0 gap-1.5">
          <Sparkles className="size-3.5" />
          FEFO Öner
        </Button>
      </div>

      <AnimatePresence>
        {result ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl bg-muted/60 p-3">
              {result.error ? (
                <p className="flex items-center gap-1.5 text-caption text-danger-fg">
                  <TriangleAlert className="size-3.5" />
                  {result.error}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {result.allocations.map((a) => (
                    <div key={a.lotId} className="flex items-center justify-between text-caption">
                      <span className="flex items-center gap-1.5 font-mono text-neutral-700">
                        <PackageCheck className="size-3.5 text-brand-600" />
                        {a.lotNumber}
                      </span>
                      <span className="tabular-nums font-medium text-neutral-900">
                        {formatKgValue(a.quantityKg)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ShippingBoard({ rows }: { rows: ShippingRow[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <VariantCard key={row.variantId} row={row} />
      ))}
    </div>
  );
}
