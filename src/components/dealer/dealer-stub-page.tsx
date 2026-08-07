import type { LucideIcon } from "lucide-react";
import { DealerCard, type DealerCardTone } from "@/components/dealer/dealer-card";

/**
 * Shared shell for bayi portal screens whose backend isn't built yet
 * (payments, deliveries, notifications, …). Keeps them visually consistent
 * with the rest of the portal instead of a bare EmptyState.
 */
export function DealerStubPage({
  icon,
  tone = "neutral",
  title,
  description,
  tip,
  action,
}: {
  icon: LucideIcon;
  tone?: DealerCardTone;
  title: string;
  description: string;
  tip?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="pb-24 sm:pb-6">
      <h1 className="mb-4 text-xl font-bold text-[var(--panel-ink)] sm:text-2xl">{title}</h1>
      <DealerCard icon={icon} tone={tone}>
        <p className="text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
          {description}
        </p>
        {tip ? <p className="mt-2 text-caption text-[var(--panel-ink-muted)]">{tip}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </DealerCard>
    </div>
  );
}
