import type { ReactNode } from "react";
import { ExpiryBadge } from "@/components/yg-ops/shared/expiry-badge";
import { formatYgMoney, formatYgQty } from "@/lib/yg-ops/format";
import { cn } from "@/lib/utils";

export function ProductCard({
  name,
  imageUrl,
  priceKurus,
  stockKg,
  packCount,
  packLabel = "koli",
  expirationDate,
  footer,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  priceKurus: number;
  stockKg: number;
  packCount: number;
  packLabel?: string;
  expirationDate?: Date | string | number | null;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] bg-[var(--yg-panel)]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- mock ops catalog; no remote optimizer needed
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
            Görsel yok
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-[length:var(--yg-text-16)] font-medium text-[var(--yg-text)]">{name}</h3>
        <p className="text-[length:var(--yg-text-14)] font-semibold tabular-nums text-[var(--yg-primary-text)]">
          {formatYgMoney(priceKurus)}
        </p>
        <p className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
          Stok {formatYgQty(packCount, stockKg, packLabel)}
        </p>
        {expirationDate ? <ExpiryBadge expirationDate={expirationDate} /> : null}
        {footer ? <div className="mt-auto pt-2">{footer}</div> : null}
      </div>
    </article>
  );
}
