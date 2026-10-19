import type {
  NotificationScheduleDetail,
  NotificationScheduleQueryApi,
} from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  cloneFixture,
  notificationScheduleListFixture,
  notificationScheduleResultsFixture,
} from "~/features/notifications/mock/notification-fixtures";
import { ApiClientError } from "~/lib/api-client-error";

export function createNotificationMonitorFixtures(
  now = Date.now()
): NotificationScheduleDetail[] {
  return notificationScheduleListFixture.items.map((item, index) => {
    const scheduled = item.status === "scheduled";
    const resolving = item.status === "resolving";
    const sending = item.status === "sending";
    const stopped = item.status === "stopped";
    const sendAt = new Date(
      now + (scheduled ? index + 1 : -(index + 1)) * 60_000
    ).toISOString();
    return {
      ...cloneFixture(item),
      sendAt,
      stop: stopped
        ? { reason: "source_deleted", stoppedAt: sendAt, stoppedBy: null }
        : null,
      audienceProgress: {
        totalCount: 4,
        resolvedCount: scheduled ? 0 : resolving ? 2 : 4,
      },
      recipientProgress: {
        count: scheduled ? 0 : 40,
        status: scheduled || resolving ? "pending" : "resolved",
      },
      deliveryProgress: {
        totalCount: scheduled || resolving ? 0 : 42,
        pendingCount: sending ? 10 : 0,
        sendingCount: sending ? 2 : 0,
        retryWaitCount: sending ? 2 : 0,
        sentCount:
          scheduled || resolving ? 0 : sending ? 28 : stopped ? 30 : 40,
        failedCount:
          item.status === "failed" || item.status === "completed" ? 2 : 0,
        stoppedCount: stopped ? 12 : 0,
      },
    };
  });
}

export function createMockNotificationMonitorApi(
  fixtures = createNotificationMonitorFixtures()
): NotificationScheduleQueryApi {
  return {
    async list(query) {
      const at = Date.now();
      const jstDayStart =
        Math.floor((at + 9 * 60 * 60 * 1000) / 86_400_000) * 86_400_000 -
        9 * 60 * 60 * 1000;
      const from =
        query?.from && query?.to ? Date.parse(query.from) : jstDayStart;
      const to = query?.to
        ? Date.parse(query.to)
        : jstDayStart + 86_400_000 - 1;
      return {
        items: fixtures
          .filter((item) => {
            const sendAt = Date.parse(item.sendAt);
            return sendAt >= from && sendAt <= to;
          })
          .map((item) => ({
            notificationId: item.notificationId,
            notificationScheduleId: item.notificationScheduleId,
            content: cloneFixture(item.content),
            importance: item.importance,
            sendAt: item.sendAt,
            status: item.status,
            stop: cloneFixture(item.stop),
            creation: cloneFixture(item.creation),
          })),
      };
    },
    async getDetail(id) {
      const item = fixtures.find((item) => item.notificationScheduleId === id);
      if (!item)
        throw new ApiClientError(
          404,
          "配信が見つかりません。",
          "NOTIFICATION_SCHEDULE_NOT_FOUND"
        );
      return cloneFixture(item);
    },
    async getResults(id) {
      return {
        ...cloneFixture(notificationScheduleResultsFixture),
        notificationScheduleId: id,
      };
    },
  };
}
