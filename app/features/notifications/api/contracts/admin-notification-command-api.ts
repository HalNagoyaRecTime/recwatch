import type {
  AdminNotificationDetail,
  NotificationCreateRequest,
  NotificationPatchRequest,
} from "~/features/notifications/model/admin-notification";

export type NotificationCreateResponse = {
  notificationId: number;
  notificationScheduleId: number;
};

export interface AdminNotificationCommandApi {
  create(
    request: NotificationCreateRequest
  ): Promise<NotificationCreateResponse>;
  patch(
    notificationId: number,
    request: NotificationPatchRequest
  ): Promise<AdminNotificationDetail>;
  delete(notificationId: number): Promise<void>;
}
