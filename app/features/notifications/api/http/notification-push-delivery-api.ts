import type { NotificationPushDeliveryApi } from "~/features/notifications/api/contracts/notification-push-delivery-api";
import { requirePositiveId } from "~/features/notifications/api/mappers/notification-query-mapper";
import { parseNotificationPushDeliveryDetail } from "~/features/notifications/api/mappers/notification-schedule-response-parser";
import { apiClient } from "~/lib/api-client";

export type NotificationPushDeliveryHttpClient = {
  get(path: string): Promise<unknown>;
};

export function createHttpNotificationPushDeliveryApi(
  client: NotificationPushDeliveryHttpClient = apiClient
): NotificationPushDeliveryApi {
  return {
    async getDetail(notificationPushDeliveryId) {
      requirePositiveId(notificationPushDeliveryId);
      return parseNotificationPushDeliveryDetail(
        await client.get(
          `/api/v1/admin/notifications/push-deliveries/${notificationPushDeliveryId}`
        )
      );
    },
  };
}

export const httpNotificationPushDeliveryApi =
  createHttpNotificationPushDeliveryApi();
