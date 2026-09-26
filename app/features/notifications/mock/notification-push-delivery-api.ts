import type { NotificationPushDeliveryApi } from "~/features/notifications/api/contracts/notification-push-delivery-api";
import {
  cloneFixture,
  notificationPushDeliveryDetailFixture,
} from "~/features/notifications/mock/notification-fixtures";

export const mockNotificationPushDeliveryApi: NotificationPushDeliveryApi = {
  async getDetail() {
    return cloneFixture(notificationPushDeliveryDetailFixture);
  },
};
