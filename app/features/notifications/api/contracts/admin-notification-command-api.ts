import type {
  NotificationCreateRequestDto,
  NotificationCreateResponseDto,
  NotificationPatchRequestDto,
  NotificationPatchResponseDto,
} from "~/features/notifications/api/dto/admin-notification-dto";

export interface AdminNotificationCommandApi {
  create(
    request: NotificationCreateRequestDto
  ): Promise<NotificationCreateResponseDto>;
  patch(
    notificationId: number,
    request: NotificationPatchRequestDto
  ): Promise<NotificationPatchResponseDto>;
  delete(notificationId: number): Promise<void>;
}
