"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setProductActiveAction } from "@/app/(panel)/panel/urunler/actions";

export function ProductArchiveToggle({
  productId,
  slug,
  active,
}: {
  productId: string;
  slug: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (
      active &&
      !window.confirm(
        "Bu ürünü arşivlemek istediğinize emin misiniz? Mağazadan ve panel listelerinden gizlenir; sipariş/lot geçmişi bozulmaz.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await setProductActiveAction(productId, slug, !active);
        toast.success(active ? "Ürün arşivlendi" : "Ürün tekrar aktif");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "İşlem başarısız");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={toggle}
      className="gap-1.5"
    >
      {active ? <Archive className="size-3.5" /> : <ArchiveRestore className="size-3.5" />}
      {active ? "Arşivle" : "Aktifleştir"}
    </Button>
  );
}
