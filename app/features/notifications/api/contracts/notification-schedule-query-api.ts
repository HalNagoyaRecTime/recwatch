import type {
  NotificationScheduleDetail,
  NotificationScheduleListQuery,
  NotificationScheduleListResponse,
  NotificationScheduleResults,
  NotificationScheduleResultsQuery,
} from "~/features/notifications/api/contracts/notification-schedule-types";

export type {
  NotificationResultDelivery,
  NotificationScheduleDetail,
  NotificationScheduleListItem,
  NotificationScheduleResults,
} from "~/features/notifications/api/contracts/notification-schedule-types";
export type NotificationDeliveryProgress =
  NotificationScheduleDetail["deliveryProgress"];

export interface NotificationScheduleQueryApi {
  list(
    query?: NotificationScheduleListQuery
  ): Promise<NotificationScheduleListResponse>;
  getDetail(
    notificationScheduleId: number
  ): Promise<NotificationScheduleDetail>;
  getResults(
    notificationScheduleId: number,
    query: NotificationScheduleResultsQuery
  ): Promise<NotificationScheduleResults>;
}
