import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type PageHeaderAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
};

/**
 * Single page header for all panel screens.
 * Layout: title + count + description | primary + overflow secondary.
 */
export function PageHeader({
  title,
  count,
  description,
  primaryAction,
  secondaryActions,
  actions,
  tabs,
  className,
}: {
  title: string;
  count?: number;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryActions?: PageHeaderAction[];
  /** @deprecated Prefer primaryAction */
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}) {
  const right = primaryAction ?? actions;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex min-h-14 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              {title}
            </h1>
            {typeof count === "number" ? (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--surface-3)] px-2 text-[length:var(--text-caption)] font-semibold tabular-nums text-[var(--text-muted)]">
                {count}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1 max-w-2xl text-[length:var(--text-body)] text-[var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        {(right || (secondaryActions && secondaryActions.length > 0)) && (
          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
            {secondaryActions && secondaryActions.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9"
                    aria-label="Diğer işlemler"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {secondaryActions.map((a) => (
                    <DropdownMenuItem
                      key={a.label}
                      disabled={a.disabled}
                      onClick={a.onClick}
                    >
                      {a.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {right}
          </div>
        )}
      </div>
      {tabs}
    </div>
  );
}
