"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dealerCancelOrderAction } from "@/app/(dealer-portal)/bayi/siparis/actions";

export function DealerCancelOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setError(null);
    if (!reason.trim()) {
      setError("İptal nedeni gerekli");
      return;
    }
    startTransition(async () => {
      const result = await dealerCancelOrderAction({ orderId, reason });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Sipariş iptal edildi");
      setOpen(false);
      setReason("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-[var(--danger-text)] hover:text-[var(--danger-text)]"
      >
        <Ban className="size-3.5" />
        İptal Et
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Siparişi iptal et</DialogTitle>
          <DialogDescription>
            #{orderId.slice(-6)} numaralı sipariş iptal edilecek. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="İptal nedeni"
          rows={3}
        />
        {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Vazgeç
          </Button>
          <Button type="button" variant="destructive" onClick={handleCancel} disabled={isPending}>
            {isPending ? "İptal ediliyor…" : "Siparişi iptal et"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
