import type { NotificationScheduleQueryApi } from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  cloneFixture,
  notificationScheduleDetailFixture,
  notificationScheduleListFixture,
  notificationScheduleResultsFixture,
} from "~/features/notifications/mock/notification-fixtures";

export const mockNotificationScheduleQueryApi: NotificationScheduleQueryApi = {
  async list() {
    return cloneFixture(notificationScheduleListFixture);
  },
  async getDetail(notificationScheduleId) {
    const detail = cloneFixture(notificationScheduleDetailFixture);
    detail.notificationScheduleId = notificationScheduleId;
    return detail;
  },
  async getResults(notificationScheduleId) {
    const results = cloneFixture(notificationScheduleResultsFixture);
    results.notificationScheduleId = notificationScheduleId;
    return results;
  },
};
