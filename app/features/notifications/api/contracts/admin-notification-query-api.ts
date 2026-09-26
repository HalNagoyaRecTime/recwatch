import type {
  AdminNotificationDetail,
  AdminNotificationListQuery,
  AdminNotificationListResponse,
} from "~/features/notifications/api/contracts/admin-notification-types";

export type {
  AdminNotificationDetail,
  AdminNotificationListItem,
  AdminNotificationListQuery,
  AdminNotificationListResponse,
} from "~/features/notifications/api/contracts/admin-notification-types";

export interface AdminNotificationQueryApi {
  list(
    query?: AdminNotificationListQuery
  ): Promise<AdminNotificationListResponse>;
  getDetail(notificationId: number): Promise<AdminNotificationDetail>;
}
