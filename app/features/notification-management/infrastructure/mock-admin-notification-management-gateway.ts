import type { AdminNotificationManagementGateway } from "../application/admin-notification-management-gateway";
import { NotificationManagementError } from "../application/notification-management-error";
import type {
  ManagedNotification,
  NotificationUpdate,
} from "../model/managed-notification";
import { canModifyNotification } from "../model/managed-notification";

let notifications: ManagedNotification[] = [
  createNotification({
    id: 101,
    title: "競技開始時間の変更",
    body: "走れ！〇人〇脚！の開始時間が09:00から09:10に変更になりました。",
    audienceName: "競技参加者 30名",
    scheduledAt: "2026-11-07T09:05:00+09:00",
    relatedEventId: 1,
    relatedEventName: "走れ！〇人〇脚！",
    status: "draft",
    count: 30,
  }),
  createNotification({
    id: 102,
    title: "集合場所のお知らせ",
    body: "ガチンコ綱引きの集合場所は集合場所Dです。",
    audienceName: "配信対象者 28名",
    scheduledAt: "2026-11-07T10:10:00+09:00",
    relatedEventId: null,
    relatedEventName: null,
    status: "sending",
    count: 28,
  }),
  createNotification({
    id: 103,
    title: "緊急連絡",
    body: "昼休み終了時刻を13:20に変更します。",
    audienceName: "配信対象者 120名",
    scheduledAt: "2026-11-07T13:20:00+09:00",
    relatedEventId: null,
    relatedEventName: null,
    status: "sent",
    count: 120,
  }),
  createNotification({
    id: 104,
    title: "紙飛行機飛ばし",
    body: "紙飛行機飛ばしの集合場所は集合場所Cです。",
    audienceName: "競技参加者 24名",
    scheduledAt: "2026-11-07T13:20:00+09:00",
    relatedEventId: 4,
    relatedEventName: "紙飛行機飛ばし",
    status: "failed",
    count: 24,
  }),
];

function createNotification(
  input: Omit<
    ManagedNotification,
    | "creatorName"
    | "deliverySummary"
    | "recipientCount"
    | "createdAt"
    | "updatedAt"
  > & { count: number }
): ManagedNotification {
  const { count, ...notification } = input;
  return {
    ...notification,
    creatorName: "HAL 太郎",
    recipientCount: count,
    deliverySummary: {
      total: count,
      draft: input.status === "draft" ? count : 0,
      sending: input.status === "sending" ? count : 0,
      sent: input.status === "sent" ? count : 0,
      failed: input.status === "failed" ? count : 0,
    },
    createdAt: "2026-11-07T08:00:00+09:00",
    updatedAt: "2026-11-07T08:00:00+09:00",
  };
}

function cloneNotification(notification: ManagedNotification) {
  return {
    ...notification,
    deliverySummary: { ...notification.deliverySummary },
  };
}

export const mockAdminNotificationManagementGateway: AdminNotificationManagementGateway =
  {
    async list(query = {}) {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      const filtered = query.status
        ? notifications.filter(
            (notification) => notification.status === query.status
          )
        : notifications;
      const offset = query.offset ?? 0;
      const limit = query.limit ?? 50;

      return {
        notifications: filtered
          .slice(offset, offset + limit)
          .map(cloneNotification),
        total: filtered.length,
        limit,
        offset,
      };
    },

    async getById(notificationId) {
      const notification = notifications.find(
        (item) => item.id === notificationId
      );
      if (!notification) {
        throw new NotificationManagementError("not_found");
      }
      return cloneNotification(notification);
    },

    async update(notificationId, update) {
      const notification = notifications.find(
        (item) => item.id === notificationId
      );
      if (!notification) {
        throw new NotificationManagementError("not_found");
      }
      if (!canModifyNotification(notification)) {
        throw new NotificationManagementError("conflict");
      }

      const updated = applyUpdate(notification, update);
      notifications = notifications.map((item) =>
        item.id === notificationId ? updated : item
      );
      return cloneNotification(updated);
    },

    async delete(notificationId) {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      const notification = notifications.find(
        (item) => item.id === notificationId
      );
      if (!notification) {
        throw new NotificationManagementError("not_found");
      }
      if (!canModifyNotification(notification)) {
        throw new NotificationManagementError("conflict");
      }
      notifications = notifications.filter(
        (item) => item.id !== notificationId
      );
    },
  };

function applyUpdate(
  notification: ManagedNotification,
  update: NotificationUpdate
) {
  return {
    ...notification,
    title: update.title ?? notification.title,
    body: update.body ?? notification.body,
    scheduledAt: update.scheduledAt ?? notification.scheduledAt,
    updatedAt: new Date().toISOString(),
  };
}
