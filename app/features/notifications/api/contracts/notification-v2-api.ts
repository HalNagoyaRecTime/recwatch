import type {
  AdminNotificationDetailDto,
  AdminNotificationListResponseDto,
  NotificationAudienceCountRequestDto,
  NotificationAudienceCountResponseDto,
  NotificationConfigDto,
  NotificationCreateRequestDto,
  NotificationCreateResponseDto,
  NotificationDateRangeQueryDto,
  NotificationPatchRequestDto,
  NotificationPushDeliveryDetailDto,
  NotificationResendRequestDto,
  NotificationScheduleDetailDto,
  NotificationScheduleListResponseDto,
  NotificationScheduleResultsQueryDto,
  NotificationScheduleResultsResponseDto,
  NotificationStopResponseDto,
} from "~/features/notifications/api/dto/notification-v2-api-dto";

export interface NotificationV2Api {
  listNotifications(
    query?: NotificationDateRangeQueryDto
  ): Promise<AdminNotificationListResponseDto>;
  getNotification(notificationId: number): Promise<AdminNotificationDetailDto>;
  createNotification(
    request: NotificationCreateRequestDto
  ): Promise<NotificationCreateResponseDto>;
  patchNotification(
    notificationId: number,
    request: NotificationPatchRequestDto
  ): Promise<AdminNotificationDetailDto>;
  deleteNotification(notificationId: number): Promise<void>;
  getConfig(): Promise<NotificationConfigDto>;
  countAudience(
    request: NotificationAudienceCountRequestDto
  ): Promise<NotificationAudienceCountResponseDto>;

  listSchedules(
    query?: NotificationDateRangeQueryDto
  ): Promise<NotificationScheduleListResponseDto>;
  getSchedule(
    notificationScheduleId: number
  ): Promise<NotificationScheduleDetailDto>;
  getScheduleResults(
    notificationScheduleId: number,
    query?: NotificationScheduleResultsQueryDto
  ): Promise<NotificationScheduleResultsResponseDto>;
  deleteSchedule(notificationScheduleId: number): Promise<void>;
  resendSchedule(
    notificationScheduleId: number,
    request: NotificationResendRequestDto
  ): Promise<NotificationCreateResponseDto>;
  stopSchedule(
    notificationScheduleId: number
  ): Promise<NotificationStopResponseDto>;

  getPushDelivery(
    notificationPushDeliveryId: number
  ): Promise<NotificationPushDeliveryDetailDto>;
}
