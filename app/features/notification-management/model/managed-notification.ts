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

export type ManagedNotificationPage = {
  notifications: ManagedNotification[];
  total: number;
  limit: number;
  offset: number;
};

export type NotificationListQuery = {
  status?: ManagedNotificationStatus;
  eventId?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type NotificationUpdateAudience =
  | { type: "all" }
  | { type: "class_room"; classRoomId: number }
  | { type: "gathering"; gatheringId: number }
  | { type: "event_participants"; eventId: number };

export type NotificationUpdate = {
  title?: string;
  body?: string;
  scheduledAt?: string;
  audience?: NotificationUpdateAudience;
};

export function canModifyNotification(notification: ManagedNotification) {
  return (
    notification.deliverySummary.total > 0 &&
    notification.deliverySummary.draft === notification.deliverySummary.total
  );
}
