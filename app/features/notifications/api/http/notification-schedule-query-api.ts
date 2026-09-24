import type { NotificationScheduleQueryApi } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import type { NotificationScheduleListQueryDto } from "~/features/notifications/api/dto/notification-schedule-dto";
import {
  requirePositiveId,
  toNotificationDateRangePath,
  toNotificationScheduleResultsPath,
} from "~/features/notifications/api/mappers/notification-query-mapper";
import {
  parseNotificationScheduleDetail,
  parseNotificationScheduleListResponse,
  parseNotificationScheduleResults,
} from "~/features/notifications/api/mappers/notification-schedule-response-parser";
import { apiClient } from "~/lib/api-client";

export type NotificationScheduleQueryHttpClient = {
  get(path: string): Promise<unknown>;
};

export function createHttpNotificationScheduleQueryApi(
  client: NotificationScheduleQueryHttpClient = apiClient
): NotificationScheduleQueryApi {
  return {
    async list(query: NotificationScheduleListQueryDto = {}) {
      const path = toNotificationDateRangePath(
        "/api/v1/admin/notifications/schedules",
        query
      );
      return parseNotificationScheduleListResponse(await client.get(path));
    },

    async getDetail(notificationScheduleId) {
      requirePositiveId(notificationScheduleId);
      return parseNotificationScheduleDetail(
        await client.get(
          `/api/v1/admin/notifications/schedules/${notificationScheduleId}`
        )
      );
    },

    async getResults(notificationScheduleId, query) {
      return parseNotificationScheduleResults(
        await client.get(
          toNotificationScheduleResultsPath(notificationScheduleId, query)
        )
      );
    },
  };
}

export const httpNotificationScheduleQueryApi =
  createHttpNotificationScheduleQueryApi();
