import { apiClient } from "~/lib/api-client";
import type {
  NotificationManagementApi,
  NotificationListQuery,
  NotificationUpdate,
} from "~/features/notifications/api/contracts/notification-management-api";
import {
  toManagedNotification,
  toManagedNotificationPage,
} from "~/features/notifications/api/mappers/admin-notification-management-response-mapper";
import { toAdminNotificationListPath } from "~/features/notifications/api/mappers/admin-notification-list-query-mapper";
import { toAdminNotificationUpdateRequest } from "~/features/notifications/api/mappers/admin-notification-update-mapper";

export type AdminNotificationManagementHttpClient = {
  get(path: string): Promise<unknown>;
  put(path: string, body: unknown): Promise<unknown>;
  delete(path: string): Promise<void>;
};

export function createHttpNotificationManagementApi(
  client: AdminNotificationManagementHttpClient = apiClient
): NotificationManagementApi {
  return {
    async list(query: NotificationListQuery = {}) {
      const response = await client.get(toAdminNotificationListPath(query));
      return toManagedNotificationPage(response);
    },

    async getById(notificationId) {
      return toManagedNotification(
        await client.get(`/api/v1/admin/notifications/${notificationId}`)
      );
    },

    async update(notificationId, update: NotificationUpdate) {
      return toManagedNotification(
        await client.put(
          `/api/v1/admin/notifications/${notificationId}`,
          toAdminNotificationUpdateRequest(update)
        )
      );
    },

    async delete(notificationId) {
      await client.delete(`/api/v1/admin/notifications/${notificationId}`);
    },
  };
}

export const httpNotificationManagementApi =
  createHttpNotificationManagementApi();
