"use client";

import { useTransition } from "react";
import Link from "next/link";
import { BellRing, CheckCheck, Inbox } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AppIcon } from "@/components/ui/app-icon";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/components/ui/notification-bell";
import {
  markDealerNotificationReadAction,
  markAllDealerNotificationsReadAction,
} from "@/app/(dealer-portal)/bayi/bildirimler/actions";

export function DealerNotificationsSheet({
  open,
  onOpenChange,
  items,
  unreadCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NotificationItem[];
  unreadCount: number;
}) {
  const [pending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      await markDealerNotificationReadAction(id);
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllDealerNotificationsReadAction();
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-[var(--panel-border)] bg-[var(--panel-surface)] p-0 sm:max-w-md"
      >
        {/* pr-14: Sheet close (X) absolute top-right ile çakışmasın */}
        <SheetHeader className="gap-3 border-b border-[var(--panel-border)] px-5 pt-5 pr-14 pb-4 text-left">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary-text)] ring-1 ring-[var(--primary-solid)]/15">
              <AppIcon icon={BellRing} size={18} />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--panel-ink)]">
                Bildirimler
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-[13px] text-[var(--panel-ink-muted)]">
                {unreadCount > 0
                  ? `${unreadCount} okunmamış bildirim`
                  : "Tüm bildirimler güncel"}
              </SheetDescription>
            </div>
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={markAll}
              className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full bg-[var(--primary-subtle)] px-3 text-[12px] font-semibold text-[var(--primary-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--primary-subtle)_70%,var(--primary-solid))] disabled:opacity-50"
            >
              <AppIcon icon={CheckCheck} size={14} />
              Tümü okundu
            </button>
          ) : null}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-[var(--panel-ink-muted)]">
                <AppIcon icon={Inbox} size={22} />
              </span>
              <p className="text-[14px] font-medium text-[var(--panel-ink)]">Henüz bildirim yok</p>
              <p className="max-w-[16rem] text-[13px] text-[var(--panel-ink-muted)]">
                Sipariş, sevkiyat ve cari güncellemeleri burada görünür.
              </p>
            </div>
          ) : (
            <ul>
              {items.map((n) => {
                const unread = !n.readAt;
                return (
                  <li key={n.id} className="border-b border-[var(--panel-border)]/80 last:border-0">
                    <Link
                      href={n.link ?? "/bayi/bildirimler"}
                      onClick={() => {
                        onOpenChange(false);
                        if (unread) markRead(n.id);
                      }}
                      className={cn(
                        "flex gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50",
                        unread && "bg-[var(--primary-subtle)]/35",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-2 size-2 shrink-0 rounded-full",
                          unread ? "bg-[var(--brand-600)] dark:bg-[var(--primary-solid)]" : "bg-transparent",
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-[14px] tracking-[-0.01em] text-[var(--panel-ink)]",
                            unread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--panel-ink-muted)]">
                          {n.body}
                        </p>
                        <p className="mt-1.5 text-[11px] text-[var(--panel-ink-muted)] tabular-nums">
                          {formatRelativeTime(new Date(n.createdAt))}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--panel-border)] px-5 py-3.5">
          <Link
            href="/bayi/bildirimler"
            onClick={() => onOpenChange(false)}
            className="flex h-10 w-full items-center justify-center rounded-full bg-muted text-[13px] font-semibold text-[var(--panel-ink)] transition-colors hover:bg-muted/80"
          >
            Tüm bildirimler
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
