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
  async getDetail() {
    return cloneFixture(notificationScheduleDetailFixture);
  },
  async getResults() {
    return cloneFixture(notificationScheduleResultsFixture);
  },
};
