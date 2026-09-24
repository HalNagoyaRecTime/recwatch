import type { NotificationV2Api } from "~/features/notifications/api/contracts/notification-v2-api";
import type {
  NotificationDateRangeQueryDto,
  NotificationScheduleResultsQueryDto,
} from "~/features/notifications/api/dto/notification-v2-api-dto";
import { apiClient } from "~/lib/api-client";

type NotificationV2HttpClient = Pick<
  typeof apiClient,
  "delete" | "get" | "patch" | "post"
>;

export function createHttpNotificationV2Api(
  client: NotificationV2HttpClient = apiClient
): NotificationV2Api {
  return {
    listNotifications(query = {}) {
      return client.get(
        withDateRangeQuery("/api/v1/admin/notifications", query)
      );
    },
    getNotification(notificationId) {
      return client.get(
        "/api/v1/admin/notifications/" + String(notificationId)
      );
    },
    createNotification(request) {
      return client.post("/api/v1/admin/notifications", request);
    },
    patchNotification(notificationId, request) {
      return client.patch(
        "/api/v1/admin/notifications/" + String(notificationId),
        request
      );
    },
    deleteNotification(notificationId) {
      return client.delete(
        "/api/v1/admin/notifications/" + String(notificationId)
      );
    },
    getConfig() {
      return client.get("/api/v1/admin/notifications/config");
    },
    countAudience(request) {
      return client.post("/api/v1/admin/notifications/audience-count", request);
    },
    listSchedules(query = {}) {
      return client.get(
        withDateRangeQuery("/api/v1/admin/notifications/schedules", query)
      );
    },
    getSchedule(notificationScheduleId) {
      return client.get(
        "/api/v1/admin/notifications/schedules/" +
          String(notificationScheduleId)
      );
    },
    getScheduleResults(notificationScheduleId, query = {}) {
      return client.get(
        withResultsQuery(
          "/api/v1/admin/notifications/schedules/" +
            String(notificationScheduleId) +
            "/results",
          query
        )
      );
    },
    deleteSchedule(notificationScheduleId) {
      return client.delete(
        "/api/v1/admin/notifications/schedules/" +
          String(notificationScheduleId)
      );
    },
    resendSchedule(notificationScheduleId, request) {
      return client.post(
        "/api/v1/admin/notifications/schedules/" +
          String(notificationScheduleId) +
          "/resend",
        request
      );
    },
    stopSchedule(notificationScheduleId) {
      return client.post(
        "/api/v1/admin/notifications/schedules/" +
          String(notificationScheduleId) +
          "/stop",
        undefined
      );
    },
    getPushDelivery(notificationPushDeliveryId) {
      return client.get(
        "/api/v1/admin/notifications/push-deliveries/" +
          String(notificationPushDeliveryId)
      );
    },
  };
}

export const httpNotificationV2Api = createHttpNotificationV2Api();

function withDateRangeQuery(
  path: string,
  query: NotificationDateRangeQueryDto
) {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  return appendQuery(path, params);
}

function withResultsQuery(
  path: string,
  query: NotificationScheduleResultsQueryDto
) {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  return appendQuery(path, params);
}

function appendQuery(path: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? path + "?" + query : path;
}
