import type {
  AdminNotificationDetailDto,
  AdminNotificationListItemDto,
  AdminNotificationListQueryDto,
  AdminNotificationListResponseDto,
  AdminNotificationListScheduleDto,
} from "~/features/notifications/api/dto/admin-notification-dto";

export type AdminNotificationListItem = AdminNotificationListItemDto;
export type AdminNotificationListQuery = AdminNotificationListQueryDto;
export type AdminNotificationListSchedule = AdminNotificationListScheduleDto;

export interface AdminNotificationQueryApi {
  list(
    query?: AdminNotificationListQueryDto
  ): Promise<AdminNotificationListResponseDto>;
  getDetail(notificationId: number): Promise<AdminNotificationDetailDto>;
}
