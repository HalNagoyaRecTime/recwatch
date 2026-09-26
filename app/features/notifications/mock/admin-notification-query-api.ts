import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import {
  adminNotificationDetailFixture,
  adminNotificationListFixture,
  cloneFixture,
  notificationApiErrorFixtures,
} from "~/features/notifications/mock/notification-fixtures";

export const mockAdminNotificationQueryApi: AdminNotificationQueryApi = {
  async list() {
    return cloneFixture(adminNotificationListFixture);
  },

  async getDetail(notificationId) {
    if (notificationId !== adminNotificationDetailFixture.notificationId) {
      throw notificationApiErrorFixtures.ADMIN_NOTIFICATION_NOT_FOUND();
    }
    return cloneFixture(adminNotificationDetailFixture);
  },
};
