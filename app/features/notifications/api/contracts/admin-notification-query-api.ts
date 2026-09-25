import type {
  AdminNotificationDetail as AdminNotificationDetailModel,
  AdminNotificationListItem as AdminNotificationListItemModel,
  AdminNotificationListSchedule as AdminNotificationListScheduleModel,
  NotificationScheduleSummary as NotificationScheduleSummaryModel,
} from "~/features/notifications/model/admin-notification";

export type AdminNotificationDetail = AdminNotificationDetailModel;
export type AdminNotificationListItem = AdminNotificationListItemModel;
export type AdminNotificationListSchedule = AdminNotificationListScheduleModel;
export type NotificationScheduleSummary = NotificationScheduleSummaryModel;
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
