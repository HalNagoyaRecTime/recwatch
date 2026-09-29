import type {
  NotificationScheduleDetailDto,
  NotificationScheduleListQueryDto,
  NotificationScheduleListResponseDto,
  NotificationResultDeliveryDto,
  NotificationScheduleResultsDto,
  NotificationScheduleResultsQueryDto,
} from "~/features/notifications/api/dto/notification-schedule-dto";

export type NotificationResultDelivery = NotificationResultDeliveryDto;
export type NotificationScheduleDetail = NotificationScheduleDetailDto;
export type NotificationScheduleResults = NotificationScheduleResultsDto;

export interface NotificationScheduleQueryApi {
  list(
    query?: NotificationScheduleListQueryDto
  ): Promise<NotificationScheduleListResponseDto>;
  getDetail(
    notificationScheduleId: number
  ): Promise<NotificationScheduleDetailDto>;
  getResults(
    notificationScheduleId: number,
    query: NotificationScheduleResultsQueryDto
  ): Promise<NotificationScheduleResultsDto>;
}
