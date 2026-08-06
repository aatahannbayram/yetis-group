"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "w-full gap-0 p-0 duration-[var(--motion-drawer)] sm:max-w-md",
          wide && "sm:max-w-lg",
          className,
        )}
      >
        <SheetHeader className="border-b border-[var(--panel-border)] px-4 py-3 text-left">
          <SheetTitle className="pr-8 text-[1rem] font-semibold text-[var(--panel-ink)]">
            {title}
          </SheetTitle>
          {description ? (
            <SheetDescription className="text-[var(--panel-ink-muted)]">
              {description}
            </SheetDescription>
          ) : (
            <SheetDescription className="sr-only">Detay paneli</SheetDescription>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-[var(--panel-border)] px-4 py-3">{footer}</div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
