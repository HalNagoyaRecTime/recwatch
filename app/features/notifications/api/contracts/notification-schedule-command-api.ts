import type {
  NotificationResendRequestDto,
  NotificationResendResponseDto,
  NotificationStopResponseDto,
} from "~/features/notifications/api/dto/notification-schedule-dto";

export interface NotificationScheduleCommandApi {
  cancel(notificationScheduleId: number): Promise<void>;
  resend(
    notificationScheduleId: number,
    request: NotificationResendRequestDto
  ): Promise<NotificationResendResponseDto>;
  stop(notificationScheduleId: number): Promise<NotificationStopResponseDto>;
}
