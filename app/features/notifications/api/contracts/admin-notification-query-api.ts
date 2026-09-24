import type {
  AdminNotificationDetailDto,
  AdminNotificationListQueryDto,
  AdminNotificationListResponseDto,
} from "~/features/notifications/api/dto/admin-notification-dto";

export interface AdminNotificationQueryApi {
  list(
    query?: AdminNotificationListQueryDto
  ): Promise<AdminNotificationListResponseDto>;
  getDetail(notificationId: number): Promise<AdminNotificationDetailDto>;
}
