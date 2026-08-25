import { cn } from "@/lib/utils";
import type { OrderStage } from "@/components/yg-ops/shared/status-badge";

const STEPS: { stage: OrderStage; label: string }[] = [
  { stage: "submitted", label: "Gönderildi" },
  { stage: "under_review", label: "İncelemede" },
  { stage: "confirmed", label: "Onaylandı" },
  { stage: "preparing", label: "Hazırlanıyor" },
  { stage: "shipped", label: "Sevk edildi" },
  { stage: "delivered", label: "Teslim" },
];

const ORDER_INDEX: Record<string, number> = Object.fromEntries(
  STEPS.map((s, i) => [s.stage, i]),
);

export function OrderTimeline({
  current,
  className,
}: {
  current: OrderStage;
  className?: string;
}) {
  const currentIdx = ORDER_INDEX[current] ?? -1;

  return (
    <ol className={cn("space-y-0", className)}>
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <li key={step.stage} className="flex gap-3">
            <div className="flex w-4 flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-2.5 shrink-0 rounded-full",
                  done ? "bg-[var(--yg-primary)]" : "bg-[var(--yg-border-strong)]",
                )}
              />
              {i < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "w-px flex-1",
                    i < currentIdx ? "bg-[var(--yg-primary)]" : "bg-[var(--yg-border)]",
                  )}
                />
              ) : null}
            </div>
            <p
              className={cn(
                "pb-4 text-[length:var(--yg-text-14)]",
                active
                  ? "font-medium text-[var(--yg-text)]"
                  : done
                    ? "text-[var(--yg-text-secondary)]"
                    : "text-[var(--yg-text-muted)]",
              )}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
