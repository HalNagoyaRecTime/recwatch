import type {
  NotificationScheduleDetailDto,
  NotificationScheduleListQueryDto,
  NotificationScheduleListResponseDto,
  NotificationScheduleResultsDto,
  NotificationScheduleResultsQueryDto,
} from "~/features/notifications/api/dto/notification-schedule-dto";

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
