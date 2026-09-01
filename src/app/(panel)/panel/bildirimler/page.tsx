import Link from "next/link";
import { Bell, CheckCheck, FlaskConical, Inbox, PackagePlus, RefreshCw, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { listStaffNotifications, countUnreadStaff } from "@/infra/db/notifications";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { cn } from "@/lib/utils";
import { btnInkClassName } from "@/components/ui/button";
import { markStaffNotificationReadAction, markAllStaffNotificationsReadAction } from "./actions";

const TYPE_ICON = {
  ORDER_CREATED: PackagePlus,
  ORDER_STATUS_CHANGED: RefreshCw,
  SAMPLE_REQUEST_CREATED: FlaskConical,
  SAMPLE_REQUEST_STATUS_CHANGED: FlaskConical,
  RETURN_REQUEST_CREATED: Undo2,
  RETURN_REQUEST_STATUS_CHANGED: Undo2,
} as const;

export default async function AdminNotificationsPage() {
  const [notifications, unreadCount] = await Promise.all([
    listStaffNotifications(100),
    countUnreadStaff(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Bildirimler"
        count={notifications.length}
        description="Yeni sipariş ve sipariş durum değişiklikleri burada listelenir."
        primaryAction={
          unreadCount > 0 ? (
            <form action={markAllStaffNotificationsReadAction}>
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
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Henüz bildirim yok"
          description="Yeni bir sipariş geldiğinde veya durumu değiştiğinde burada görünecek."
        />
      ) : (
        <ul className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--panel-border)] bg-[var(--panel-surface)]">
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
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {n.link ? (
                    <Link
                      href={n.link}
                      className="text-caption font-medium text-[var(--primary-text)] hover:underline"
                    >
                      Görüntüle
                    </Link>
                  ) : null}
                  {unread ? (
                    <form action={markStaffNotificationReadAction.bind(null, n.id)}>
                      <button
                        type="submit"
                        className="text-caption font-medium text-[var(--panel-ink-muted)] hover:text-[var(--panel-ink)] hover:underline"
                      >
                        Okundu işaretle
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
