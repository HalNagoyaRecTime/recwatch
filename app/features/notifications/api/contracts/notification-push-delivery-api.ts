import type { NotificationPushDeliveryDetailDto } from "~/features/notifications/api/dto/notification-schedule-dto";

export type NotificationPushDeliveryDetail = NotificationPushDeliveryDetailDto;

export interface NotificationPushDeliveryApi {
  getDetail(
    notificationPushDeliveryId: number
  ): Promise<NotificationPushDeliveryDetailDto>;
}
