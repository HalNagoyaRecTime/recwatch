import type {
  AdminNotificationDetail,
  AdminNotificationListItem,
} from "~/features/notifications/model/admin-notification";

export type AdminNotificationListQuery =
  { from?: undefined; to?: undefined } | { from: string; to: string };

export type AdminNotificationListResponse = {
  items: AdminNotificationListItem[];
};

export interface AdminNotificationQueryApi {
  list(
    query?: AdminNotificationListQuery
  ): Promise<AdminNotificationListResponse>;
  getDetail(notificationId: number): Promise<AdminNotificationDetail>;
}
