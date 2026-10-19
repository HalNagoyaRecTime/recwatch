import type { NotificationScheduleCommandApi } from "~/features/notifications/api/contracts/notification-schedule-command-api";
import { requirePositiveId } from "~/features/notifications/api/mappers/notification-query-mapper";
import { validateNotificationResendRequest } from "~/features/notifications/api/mappers/notification-request-validator";
import {
  parseNotificationResendResponse,
  parseNotificationStopResponse,
} from "~/features/notifications/api/mappers/notification-schedule-response-parser";
import { apiClient } from "~/lib/api-client";

export type NotificationScheduleCommandHttpClient = {
  post(path: string, body?: unknown): Promise<unknown>;
  delete(path: string): Promise<void>;
};

export function createHttpNotificationScheduleCommandApi(
  client: NotificationScheduleCommandHttpClient = apiClient
): NotificationScheduleCommandApi {
  return {
    async cancel(notificationScheduleId) {
      requirePositiveId(notificationScheduleId);
      await client.delete(
        `/api/v1/admin/notifications/schedules/${notificationScheduleId}`
      );
    },

    async resend(notificationScheduleId, request) {
      requirePositiveId(notificationScheduleId);
      const response = await client.post(
        `/api/v1/admin/notifications/schedules/${notificationScheduleId}/resend`,
        validateNotificationResendRequest(request)
      );
      return parseNotificationResendResponse(response);
    },

    async stop(notificationScheduleId) {
      requirePositiveId(notificationScheduleId);
      const response = await client.post(
        `/api/v1/admin/notifications/schedules/${notificationScheduleId}/stop`
      );
      return parseNotificationStopResponse(response);
    },
  };
}

export const httpNotificationScheduleCommandApi =
  createHttpNotificationScheduleCommandApi();
