import { cn } from "@/lib/utils";
import { creditUtilTone } from "@/lib/status/semantic";

export function CreditLimitBar({
  balanceKurus,
  limitKurus,
  className,
}: {
  balanceKurus: number;
  limitKurus: number | null;
  className?: string;
}) {
  if (limitKurus == null || limitKurus <= 0) {
    return (
      <p className={cn("text-[length:var(--text-caption)] text-[var(--text-muted)]", className)}>
        Limit tanımsız
      </p>
    );
  }

  const ratio = Math.max(0, balanceKurus) / limitKurus;
  const pct = Math.min(100, Math.round(ratio * 100));
  const tone = creditUtilTone(ratio);
  const over = balanceKurus > limitKurus;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-[length:var(--text-caption)] tabular-nums text-[var(--text-muted)]">
        <span>Limit kullanımı</span>
        <span
          className={cn(
            over && "font-semibold text-[var(--danger-text)]",
            tone === "warning" && !over && "text-[var(--warning-text)]",
          )}
        >
          %{pct}
          {over ? " · aşım" : ""}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kredi limit kullanımı"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            tone === "neutral" && "bg-[var(--neutral-solid)]",
            tone === "warning" && "bg-[var(--warning-solid)]",
            tone === "danger" && "bg-[var(--danger-solid)]",
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
