import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { AdminNotificationListQueryDto } from "~/features/notifications/api/dto/admin-notification-dto";
import {
  parseAdminNotificationDetail,
  parseAdminNotificationListResponse,
} from "~/features/notifications/api/mappers/admin-notification-response-parser";
import {
  requirePositiveId,
  toNotificationDateRangePath,
} from "~/features/notifications/api/mappers/notification-query-mapper";
import { apiClient } from "~/lib/api-client";

export type AdminNotificationQueryHttpClient = {
  get(path: string): Promise<unknown>;
};

export function createHttpAdminNotificationQueryApi(
  client: AdminNotificationQueryHttpClient = apiClient
): AdminNotificationQueryApi {
  return {
    async list(query: AdminNotificationListQueryDto = {}) {
      const path = toNotificationDateRangePath(
        "/api/v1/admin/notifications",
        query
      );
      return parseAdminNotificationListResponse(await client.get(path));
    },

    async getDetail(notificationId) {
      requirePositiveId(notificationId);
      return parseAdminNotificationDetail(
        await client.get(`/api/v1/admin/notifications/${notificationId}`)
      );
    },
  };
}

export const httpAdminNotificationQueryApi =
  createHttpAdminNotificationQueryApi();
