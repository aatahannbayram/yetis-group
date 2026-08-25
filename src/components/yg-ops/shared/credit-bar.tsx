import { cn } from "@/lib/utils";
import { formatYgMoney } from "@/lib/yg-ops/format";

export function CreditBar({
  usedKurus,
  limitKurus,
  compact = false,
  className,
}: {
  usedKurus: number;
  limitKurus: number;
  compact?: boolean;
  className?: string;
}) {
  const safeLimit = limitKurus > 0 ? limitKurus : 1;
  const ratio = usedKurus / safeLimit;
  const pct = Math.min(100, Math.max(0, ratio * 100));
  const remaining = Math.max(0, limitKurus - usedKurus);
  const over = usedKurus > limitKurus;

  const tone =
    ratio > 0.9 ? "var(--yg-credit-critical)" : ratio >= 0.7 ? "var(--yg-credit-warn)" : "var(--yg-credit-ok)";

  if (compact) {
    return (
      <div
        className={cn(
          "flex min-w-0 items-center gap-2 rounded-[var(--yg-radius-md)] bg-[var(--yg-panel-2)] px-3 py-2",
          className,
        )}
      >
        <span className="truncate text-[length:var(--yg-text-13)] text-[var(--yg-text-secondary)]">
          Kalan limit{" "}
          <span className="font-medium tabular-nums text-[var(--yg-text)]">
            {formatYgMoney(remaining)}
          </span>
        </span>
        {over ? (
          <span className="shrink-0 rounded-[var(--yg-radius-pill)] bg-[var(--yg-danger-subtle)] px-2 py-0.5 text-[length:var(--yg-text-12)] font-medium text-[var(--yg-danger)]">
            Aşım
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[length:var(--yg-text-13)] text-[var(--yg-text-muted)]">
          Kullanılan{" "}
          <span className="tabular-nums text-[var(--yg-text-secondary)]">
            {formatYgMoney(usedKurus)}
          </span>
          {" / "}
          <span className="tabular-nums text-[var(--yg-text-secondary)]">
            {formatYgMoney(limitKurus)}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[length:var(--yg-text-13)] tabular-nums text-[var(--yg-text)]">
            Kalan {formatYgMoney(remaining)}
          </span>
          {over ? (
            <span className="rounded-[var(--yg-radius-pill)] bg-[var(--yg-danger-subtle)] px-2 py-0.5 text-[length:var(--yg-text-12)] font-medium text-[var(--yg-danger)]">
              Aşım
            </span>
          ) : null}
        </div>
      </div>
      <div
        className="h-2 overflow-hidden rounded-[var(--yg-radius-pill)] bg-[var(--yg-panel-2)]"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-[var(--yg-radius-pill)] transition-[width] duration-[var(--yg-duration-slow)]"
          style={{ width: `${pct}%`, background: tone }}
        />
      </div>
    </div>
  );
}
