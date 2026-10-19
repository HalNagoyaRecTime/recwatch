import type { NotificationAudience } from "~/features/notifications/model/notification-audience";

export type ManagedNotificationStatus = "draft" | "sending" | "sent" | "failed";

export type NotificationDeliverySummary = {
  total: number;
  draft: number;
  sending: number;
  sent: number;
  failed: number;
};

export type ManagedNotification = {
  id: number;
  title: string;
  body: string;
  audienceName: string;
  audience?: NotificationAudience;
  recipientCount: number;
  scheduledAt: string;
  creatorName: string;
  relatedEventId: number | null;
  relatedEventName: string | null;
  status: ManagedNotificationStatus;
  deliverySummary: NotificationDeliverySummary;
  createdAt: string;
  updatedAt: string;
};

export function canModifyNotification(notification: ManagedNotification) {
  return (
    notification.deliverySummary.total > 0 &&
    notification.deliverySummary.draft === notification.deliverySummary.total
  );
}
