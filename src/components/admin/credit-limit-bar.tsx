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
      <p className={cn("text-xs text-stone-400 dark:text-zinc-500", className)}>Limit tanımsız</p>
    );
  }

  const ratio = Math.max(0, balanceKurus) / limitKurus;
  const pct = Math.min(100, Math.round(ratio * 100));
  const tone = creditUtilTone(ratio);
  const over = balanceKurus > limitKurus;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between gap-2 text-xs tabular-nums text-stone-500 dark:text-zinc-400">
        <span>Kullanım</span>
        <span
          className={cn(
            over && "font-semibold text-red-600 dark:text-red-400",
            tone === "warning" && !over && "text-amber-700 dark:text-amber-400",
          )}
        >
          %{pct}
          {over ? " aşım" : ""}
        </span>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-stone-100 dark:bg-zinc-800"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kredi limit kullanımı"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            tone === "neutral" && "bg-stone-400 dark:bg-zinc-500",
            tone === "warning" && "bg-amber-500",
            tone === "danger" && "bg-red-500",
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
