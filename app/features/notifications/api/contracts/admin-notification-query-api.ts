import type {
  AdminNotificationDetailDto,
  AdminNotificationListItemDto,
  AdminNotificationListQueryDto,
  AdminNotificationListResponseDto,
  AdminNotificationListScheduleDto,
  NotificationScheduleSummaryDto,
} from "~/features/notifications/api/dto/admin-notification-dto";

export type AdminNotificationDetail = AdminNotificationDetailDto;
export type AdminNotificationListItem = AdminNotificationListItemDto;
export type AdminNotificationListQuery = AdminNotificationListQueryDto;
export type AdminNotificationListSchedule = AdminNotificationListScheduleDto;
export type NotificationScheduleSummary = NotificationScheduleSummaryDto;

export interface AdminNotificationQueryApi {
  list(
    query?: AdminNotificationListQueryDto
  ): Promise<AdminNotificationListResponseDto>;
  getDetail(notificationId: number): Promise<AdminNotificationDetailDto>;
}
