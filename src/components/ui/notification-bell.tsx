"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell({
  items,
  unreadCount,
  viewAllHref,
  onMarkRead,
  onMarkAllRead,
  triggerClassName,
}: {
  items: NotificationItem[];
  unreadCount: number;
  viewAllHref: string;
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:size-9",
            triggerClassName,
          )}
          aria-label={unreadCount > 0 ? `Bildirimler (${unreadCount} okunmamış)` : "Bildirimler"}
        >
          <Bell className="size-4" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex size-2 items-center justify-center rounded-full bg-[var(--danger-solid)] ring-2 ring-[var(--panel-surface)]" />
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-3.5 py-2.5">
          <p className="text-body-sm font-semibold text-[var(--panel-ink)]">Bildirimler</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await onMarkAllRead();
                })
              }
              className="inline-flex items-center gap-1 text-caption font-medium text-[var(--primary-text)] hover:underline disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" aria-hidden />
              Tümünü okundu işaretle
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Inbox className="size-6 text-[var(--panel-ink-muted)]" aria-hidden />
            <p className="text-caption text-[var(--panel-ink-muted)]">Henüz bildirim yok.</p>
          </div>
        ) : (
          <ul className="max-h-[24rem] overflow-y-auto">
            {items.map((n) => {
              const unread = !n.readAt;
              return (
                <li key={n.id} className="border-b border-[var(--panel-border)] last:border-0">
                  <Link
                    href={n.link ?? viewAllHref}
                    onClick={() => {
                      setOpen(false);
                      if (unread) startTransition(() => onMarkRead(n.id));
                    }}
                    className={cn(
                      "flex gap-2.5 px-3.5 py-3 transition-colors hover:bg-[var(--surface-3)]",
                      unread && "bg-[var(--primary-subtle)]/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        unread ? "bg-[var(--primary-solid)]" : "bg-transparent",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-[var(--panel-ink)]">
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-caption text-[var(--panel-ink-muted)]">
                        {n.body}
                      </p>
                      <p className="mt-1 text-caption text-[var(--panel-ink-muted)]">
                        {formatRelativeTime(new Date(n.createdAt))}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-[var(--panel-border)] px-3.5 py-2.5 text-center">
          <Link
            href={viewAllHref}
            onClick={() => setOpen(false)}
            className="text-caption font-semibold text-[var(--primary-text)] hover:underline"
          >
            Tümünü gör
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
