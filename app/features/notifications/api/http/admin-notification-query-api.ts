import type {
  AdminNotificationListQuery,
  AdminNotificationQueryApi,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import {
  parseAdminNotificationDetail,
  parseAdminNotificationListResponse,
} from "~/features/notifications/api/mappers/admin-notification-response-parser";
import { requirePositiveId } from "~/features/notifications/api/mappers/notification-query-mapper";
import { apiClient } from "~/lib/api-client";

export type AdminNotificationQueryHttpClient = {
  get(path: string): Promise<unknown>;
};

export function createHttpAdminNotificationQueryApi(
  client: AdminNotificationQueryHttpClient = apiClient
): AdminNotificationQueryApi {
  return {
    async list(query: AdminNotificationListQuery = {}) {
      const params = new URLSearchParams();
      if (query.from !== undefined && query.to !== undefined) {
        params.set("from", query.from);
        params.set("to", query.to);
      }
      if (query.page !== undefined) {
        params.set("page", String(query.page));
      }
      if (query.limit !== undefined) {
        params.set("limit", String(query.limit));
      }
      const separator = params.toString() ? "?" : "";
      const path = `/api/v1/admin/notifications${separator}${params.toString()}`;
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
