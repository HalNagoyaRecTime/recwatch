import type { NotificationAudience } from "~/features/notifications/model/notification-audience";
import type {
  ManagedNotification,
  ManagedNotificationStatus,
} from "~/features/notifications/model/notification";

export type ManagedNotificationPage = {
  notifications: ManagedNotification[];
  total: number;
  limit: number;
  offset: number;
};

export type NotificationListQuery = {
  sendStatus?: ManagedNotificationStatus;
  eventId?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type NotificationUpdateAudience = Exclude<
  NotificationAudience,
  { type: "resolved_recipients" }
>;

export type NotificationUpdate = {
  title?: string;
  body?: string;
  scheduledAt?: string;
  audience?: NotificationUpdateAudience;
};

export interface NotificationManagementApi {
  list(query?: NotificationListQuery): Promise<ManagedNotificationPage>;
  getById(notificationId: number): Promise<ManagedNotification>;
  update(
    notificationId: number,
    update: NotificationUpdate
  ): Promise<ManagedNotification>;
  delete(notificationId: number): Promise<void>;
}
