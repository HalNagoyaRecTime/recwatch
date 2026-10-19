import type {
  AdminNotificationDetail,
  NotificationCreateRequest,
  NotificationCreateResponse,
  NotificationPatchRequest,
} from "~/features/notifications/api/contracts/admin-notification-types";

export type {
  AdminNotificationDetail,
  NotificationAudienceInputItem,
  NotificationCreateRequest,
  NotificationCreateResponse,
  NotificationPatchRequest,
} from "~/features/notifications/api/contracts/admin-notification-types";

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
