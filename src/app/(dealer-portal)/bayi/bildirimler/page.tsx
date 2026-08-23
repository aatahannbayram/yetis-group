import { Bell, CheckCheck, Inbox, PackagePlus, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { resolveDealerContext } from "@/features/dealer/actions";
import { listDealerNotifications, countUnreadDealer } from "@/infra/db/notifications";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { cn } from "@/lib/utils";
import { btnInkClassName } from "@/components/ui/button";
import {
  markDealerNotificationReadAction,
  markAllDealerNotificationsReadAction,
} from "./actions";

const TYPE_ICON = {
  ORDER_CREATED: PackagePlus,
  ORDER_STATUS_CHANGED: RefreshCw,
} as const;

export default async function Page() {
  const ctx = await resolveDealerContext();
  if (!ctx) {
    return (
      <EmptyState icon={Bell} title="Oturum bulunamadı" description="Lütfen tekrar giriş yapın." />
    );
  }

  const [notifications, unreadCount] = await Promise.all([
    listDealerNotifications(ctx.dealerId, 100),
    countUnreadDealer(ctx.dealerId),
  ]);

  return (
    <div className="pb-24 sm:pb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[var(--panel-ink)] sm:text-2xl">Bildirimler</h1>
        {unreadCount > 0 ? (
          <form action={markAllDealerNotificationsReadAction}>
            <button
              type="submit"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-caption font-semibold",
                btnInkClassName,
              )}
            >
              <CheckCheck className="size-3.5" aria-hidden />
              Tümünü okundu işaretle
            </button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Henüz bildirim yok"
          description="Sipariş verdiğinizde ve sipariş durumu değiştiğinde burada görünecek."
        />
      ) : (
        <ul className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--panel-border)] bg-[var(--panel-surface)] shadow-[var(--shadow-sm)]">
          {notifications.map((n) => {
            const unread = !n.readAt;
            const Icon = TYPE_ICON[n.type] ?? Bell;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 border-b border-[var(--panel-border)] px-4 py-3.5 last:border-0",
                  unread && "bg-[var(--primary-subtle)]/40",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-secondary)]">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-body-sm font-semibold text-[var(--panel-ink)]">{n.title}</p>
                    {unread ? (
                      <span className="size-1.5 shrink-0 rounded-full bg-[var(--primary-solid)]" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-body-sm text-[var(--panel-ink-muted)]">{n.body}</p>
                  <p className="mt-1 text-caption text-[var(--panel-ink-muted)]">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
                {unread ? (
                  <form action={markDealerNotificationReadAction.bind(null, n.id)} className="shrink-0">
                    <button
                      type="submit"
                      className="text-caption font-medium text-[var(--panel-ink-muted)] hover:text-[var(--panel-ink)] hover:underline"
                    >
                      Okundu işaretle
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
