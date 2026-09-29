import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import {
  adminNotificationDetailFixture,
  cloneFixture,
  notificationApiErrorFixtures,
} from "~/features/notifications/mock/notification-fixtures";

export const mockAdminNotificationCommandApi: AdminNotificationCommandApi = {
  async create() {
    return { notificationId: 108, notificationScheduleId: 508 };
  },

  async patch(notificationId) {
    if (notificationId !== adminNotificationDetailFixture.notificationId) {
      throw notificationApiErrorFixtures.ADMIN_NOTIFICATION_NOT_FOUND();
    }
    return cloneFixture(adminNotificationDetailFixture);
  },

  async delete(notificationId) {
    if (notificationId !== adminNotificationDetailFixture.notificationId) {
      throw notificationApiErrorFixtures.ADMIN_NOTIFICATION_NOT_FOUND();
    }
  },
};
