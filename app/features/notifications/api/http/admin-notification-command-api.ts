import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import {
  parseAdminNotificationDetail,
  parseNotificationCreateResponse,
} from "~/features/notifications/api/mappers/admin-notification-response-parser";
import { requirePositiveId } from "~/features/notifications/api/mappers/notification-query-mapper";
import {
  validateNotificationCreateRequest,
  validateNotificationPatchRequest,
} from "~/features/notifications/api/mappers/notification-request-validator";
import { apiClient } from "~/lib/api-client";

export type AdminNotificationCommandHttpClient = {
  post(path: string, body: unknown): Promise<unknown>;
  patch(path: string, body: unknown): Promise<unknown>;
  delete(path: string): Promise<void>;
};

export function createHttpAdminNotificationCommandApi(
  client: AdminNotificationCommandHttpClient = apiClient
): AdminNotificationCommandApi {
  return {
    async create(request) {
      const response = await client.post(
        "/api/v1/admin/notifications",
        validateNotificationCreateRequest(request)
      );
      return parseNotificationCreateResponse(response);
    },

    async patch(notificationId, request) {
      requirePositiveId(notificationId);
      const response = await client.patch(
        `/api/v1/admin/notifications/${notificationId}`,
        validateNotificationPatchRequest(request)
      );
      return parseAdminNotificationDetail(response);
    },

    async delete(notificationId) {
      requirePositiveId(notificationId);
      await client.delete(`/api/v1/admin/notifications/${notificationId}`);
    },
  };
}

export const httpAdminNotificationCommandApi =
  createHttpAdminNotificationCommandApi();
