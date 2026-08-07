import { prisma } from "@/infra/db/client";
import type { NotificationAudience, NotificationType } from "@/generated/prisma";
import { sendEmail } from "@/infra/email/resend";
import {
  orderCreatedStaffEmail,
  orderCreatedDealerEmail,
  orderStatusChangedDealerEmail,
} from "@/infra/email/templates";
import {
  orderCreatedNotifications,
  orderStatusChangedNotification,
  orderStatusLabel,
  isOrderStatusEmailWorthy,
} from "@/domain/notifications/messages";
import type { OrderStatus } from "@/domain/order/state-machine";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { getSiteUrl, SITE } from "@/lib/site";
import { env } from "@/lib/env";

function createNotification(input: {
  audience: NotificationAudience;
  dealerId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
}) {
  return prisma.notification.create({ data: input });
}

/**
 * Order lifecycle -> in-app notification + best-effort email. Never throws:
 * a notification/email failure must not roll back the order transaction
 * that triggered it.
 */
export async function notifyOrderCreated(input: {
  orderId: string;
  dealerId: string;
  dealerName: string;
  dealerEmail: string | null;
  totalKurus: number;
}) {
  try {
    const totalLabel = formatMoney(money(input.totalKurus));
    const { staff, dealer } = orderCreatedNotifications({
      orderId: input.orderId,
      dealerName: input.dealerName,
      totalLabel,
    });

    await Promise.all([
      createNotification({ audience: "STAFF", type: "ORDER_CREATED", ...staff }),
      createNotification({
        audience: "DEALER",
        dealerId: input.dealerId,
        type: "ORDER_CREATED",
        ...dealer,
      }),
    ]);

    const siteUrl = getSiteUrl();
    const emailJobs = [
      sendEmail({
        to: env.NOTIFICATIONS_STAFF_EMAIL || SITE.email,
        ...orderCreatedStaffEmail({
          dealerName: input.dealerName,
          totalLabel,
          orderId: input.orderId,
          siteUrl,
        }),
      }),
    ];
    if (input.dealerEmail) {
      emailJobs.push(
        sendEmail({
          to: input.dealerEmail,
          ...orderCreatedDealerEmail({
            dealerName: input.dealerName,
            totalLabel,
            orderId: input.orderId,
            siteUrl,
          }),
        }),
      );
    }
    await Promise.allSettled(emailJobs);
  } catch (err) {
    console.error("[notifications] notifyOrderCreated failed:", err);
  }
}

export async function notifyOrderStatusChanged(input: {
  orderId: string;
  dealerId: string;
  dealerName: string;
  dealerEmail: string | null;
  status: OrderStatus;
}) {
  try {
    const draft = orderStatusChangedNotification({ orderId: input.orderId, status: input.status });
    await createNotification({
      audience: "DEALER",
      dealerId: input.dealerId,
      type: "ORDER_STATUS_CHANGED",
      ...draft,
    });

    if (input.dealerEmail && isOrderStatusEmailWorthy(input.status)) {
      await sendEmail({
        to: input.dealerEmail,
        ...orderStatusChangedDealerEmail({
          dealerName: input.dealerName,
          statusLabel: orderStatusLabel(input.status),
          orderId: input.orderId,
          siteUrl: getSiteUrl(),
        }),
      });
    }
  } catch (err) {
    console.error("[notifications] notifyOrderStatusChanged failed:", err);
  }
}

// ---- Listing / read state ----

export async function listStaffNotifications(limit = 20) {
  return prisma.notification.findMany({
    where: { audience: "STAFF" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countUnreadStaff() {
  return prisma.notification.count({ where: { audience: "STAFF", readAt: null } });
}

export async function listDealerNotifications(dealerId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { audience: "DEALER", dealerId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countUnreadDealer(dealerId: string) {
  return prisma.notification.count({ where: { audience: "DEALER", dealerId, readAt: null } });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
}

/** Scoped update: no-ops (rather than throws) if the notification isn't this dealer's. */
export async function markDealerNotificationRead(dealerId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, dealerId, audience: "DEALER" },
    data: { readAt: new Date() },
  });
}

export async function markAllStaffRead() {
  return prisma.notification.updateMany({
    where: { audience: "STAFF", readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllDealerRead(dealerId: string) {
  return prisma.notification.updateMany({
    where: { audience: "DEALER", dealerId, readAt: null },
    data: { readAt: new Date() },
  });
}
