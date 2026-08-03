import { apiClient } from "~/lib/api-client";
import type { AdminNotificationManagementGateway } from "~/features/notifications/application/admin-notification-management-gateway";
import type {
  NotificationListQuery,
  NotificationUpdate,
} from "~/features/notifications/model/managed-notification";
import { toNotificationManagementError } from "~/features/notifications/infrastructure/admin-notification-management-error-mapper";
import {
  toManagedNotification,
  toManagedNotificationPage,
} from "~/features/notifications/infrastructure/admin-notification-management-response-mapper";
import { toAdminNotificationListPath } from "~/features/notifications/infrastructure/admin-notification-list-query-mapper";
import { toAdminNotificationUpdateRequest } from "~/features/notifications/infrastructure/admin-notification-update-mapper";

export type AdminNotificationManagementHttpClient = {
  get(path: string): Promise<unknown>;
  put(path: string, body: unknown): Promise<unknown>;
  delete(path: string): Promise<void>;
};

export function createHttpAdminNotificationManagementGateway(
  client: AdminNotificationManagementHttpClient = apiClient
): AdminNotificationManagementGateway {
  return {
    async list(query: NotificationListQuery = {}) {
      try {
        const response = await client.get(toAdminNotificationListPath(query));
        return toManagedNotificationPage(response);
      } catch (error) {
        throw toNotificationManagementError(error);
      }
    },

    async getById(notificationId) {
      try {
        return toManagedNotification(
          await client.get(`/api/v1/admin/notifications/${notificationId}`)
        );
      } catch (error) {
        throw toNotificationManagementError(error);
      }
    },

    async update(notificationId, update: NotificationUpdate) {
      try {
        return toManagedNotification(
          await client.put(
            `/api/v1/admin/notifications/${notificationId}`,
            toAdminNotificationUpdateRequest(update)
          )
        );
      } catch (error) {
        throw toNotificationManagementError(error);
      }
    },

    async delete(notificationId) {
      try {
        await client.delete(`/api/v1/admin/notifications/${notificationId}`);
      } catch (error) {
        throw toNotificationManagementError(error);
      }
    },
  };
}

export const httpAdminNotificationManagementGateway =
  createHttpAdminNotificationManagementGateway();
