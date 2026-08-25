import { cn } from "@/lib/utils";

export type OrderStage =
  | "draft"
  | "submitted"
  | "under_review"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "rejected"
  | "cancelled";

const STAGE_META: Record<
  OrderStage,
  { label: string; color: string }
> = {
  draft: { label: "Taslak", color: "var(--yg-stage-draft)" },
  submitted: { label: "Gönderildi", color: "var(--yg-stage-review)" },
  under_review: { label: "İncelemede", color: "var(--yg-stage-review)" },
  confirmed: { label: "Onaylandı", color: "var(--yg-stage-confirmed)" },
  preparing: { label: "Hazırlanıyor", color: "var(--yg-stage-preparing)" },
  shipped: { label: "Sevk edildi", color: "var(--yg-stage-shipped)" },
  delivered: { label: "Teslim", color: "var(--yg-stage-delivered)" },
  rejected: { label: "Reddedildi", color: "var(--yg-stage-rejected)" },
  cancelled: { label: "İptal", color: "var(--yg-stage-cancelled)" },
};

export function StatusBadge({
  stage,
  className,
}: {
  stage: OrderStage;
  className?: string;
}) {
  const meta = STAGE_META[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--yg-radius-pill)] px-2.5 py-1 text-[length:var(--yg-text-12)] font-medium",
        className,
      )}
      style={{
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 16%, transparent)`,
      }}
    >
      <span aria-hidden className="size-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}
