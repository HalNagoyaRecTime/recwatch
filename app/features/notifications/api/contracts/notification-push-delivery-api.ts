import type { NotificationPushDeliveryDetail } from "~/features/notifications/api/contracts/notification-schedule-types";
export type { NotificationPushDeliveryDetail } from "~/features/notifications/api/contracts/notification-schedule-types";
export interface NotificationPushDeliveryApi {
  getDetail(
    notificationPushDeliveryId: number
  ): Promise<NotificationPushDeliveryDetail>;
}
