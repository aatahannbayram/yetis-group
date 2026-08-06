"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <div>
        <Label htmlFor="lotNumber" className="mb-1.5">
          Lot No
        </Label>
        <Input
          id="lotNumber"
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          placeholder="L-2026-08-01"
          required
        />
      </div>
      <div>
        <Label htmlFor="expirationDate" className="mb-1.5">
          SKT
        </Label>
        <Input
          id="expirationDate"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="initialKg" className="mb-1.5">
          Giriş Miktarı (kg)
        </Label>
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
      <Button type="submit" disabled={isPending} className="self-end">
        <Plus />
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
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2">
      <Select value={type} onValueChange={(v) => setType(v as "GIRIS" | "CIKIS")}>
        <SelectTrigger className="h-8 w-28">
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
        className="h-8 w-28"
        required
      />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        Kaydet
      </Button>
      {error ? <p className="w-full text-caption text-danger-fg">{error}</p> : null}
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
    <div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-h4 leading-h4">Yeni Lot</CardTitle>
        </CardHeader>
        <CardContent>
          <NewLotForm variantId={variantId} slug={slug} />
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-4">
        {lots.length === 0 ? (
          <p className="text-body-sm text-neutral-400">Henüz lot eklenmedi.</p>
        ) : (
          lots.map((lot) => (
            <Card key={lot.id} className="shadow-sm">
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-body-sm font-semibold text-neutral-900">
                      {lot.lotNumber}
                    </p>
                    <Badge
                      variant={lot.expired ? "destructive" : "outline"}
                      className={lot.expired ? undefined : "border-neutral-300 text-neutral-700"}
                    >
                      SKT: {formatDate(new Date(lot.expirationDate))}
                    </Badge>
                    {lot.expired ? <Badge variant="destructive">Süresi geçti</Badge> : null}
                  </div>
                  <p className="tabular-nums text-body-sm font-semibold text-brand-700">
                    {lot.availableKg} kg mevcut
                  </p>
                </div>

                <LotMovementForm lot={lot} slug={slug} />

                {lot.movements.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-1 border-t border-neutral-100 pt-3">
                    {lot.movements.slice(0, 5).map((movement) => (
                      <li
                        key={movement.id}
                        className="flex items-center justify-between text-caption text-neutral-500"
                      >
                        <span>
                          {movement.type === "GIRIS" ? "+" : "-"}
                          {movement.quantityKg} kg {movement.note ? `· ${movement.note}` : ""}
                        </span>
                        <span>{formatDate(new Date(movement.createdAt))}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
