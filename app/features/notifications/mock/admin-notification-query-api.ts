import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import {
  adminNotificationDetailFixture,
  adminNotificationListFixture,
  cloneFixture,
  notificationApiErrorFixtures,
} from "~/features/notifications/mock/notification-fixtures";

export const mockAdminNotificationQueryApi: AdminNotificationQueryApi = {
  async list(query = {}) {
    const fixture = cloneFixture(adminNotificationListFixture);
    if (query.from === undefined || query.to === undefined) return fixture;

    const from = Date.parse(query.from);
    const to = Date.parse(query.to);
    return {
      items: fixture.items
        .map((notification) => ({
          ...notification,
          schedules: notification.schedules.filter((schedule) => {
            const sendAt = Date.parse(schedule.sendAt);
            return sendAt >= from && sendAt <= to;
          }),
        }))
        .filter((notification) => notification.schedules.length > 0),
    };
  },

  async getDetail(notificationId) {
    if (notificationId !== adminNotificationDetailFixture.notificationId) {
      throw notificationApiErrorFixtures.ADMIN_NOTIFICATION_NOT_FOUND();
    }
    return cloneFixture(adminNotificationDetailFixture);
  },
};
