import type {
  ManagedNotification,
  ManagedNotificationPage,
  NotificationListQuery,
  NotificationUpdate,
} from "../model/managed-notification";

export interface AdminNotificationManagementGateway {
  list(query?: NotificationListQuery): Promise<ManagedNotificationPage>;
  getById(notificationId: number): Promise<ManagedNotification>;
  update(
    notificationId: number,
    update: NotificationUpdate
  ): Promise<ManagedNotification>;
  delete(notificationId: number): Promise<void>;
}
