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
    let filtered = fixture.items;
    if (query.from !== undefined && query.to !== undefined) {
      const from = Date.parse(query.from);
      const to = Date.parse(query.to);
      filtered = fixture.items
        .map((notification) => ({
          ...notification,
          schedules: notification.schedules.filter((schedule) => {
            const sendAt = Date.parse(schedule.sendAt);
            return sendAt >= from && sendAt <= to;
          }),
        }))
        .filter((notification) => notification.schedules.length > 0);
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const offset = (page - 1) * limit;
    const pagedItems = filtered.slice(offset, offset + limit);
    return {
      items: pagedItems,
      pagination: {
        page,
        limit,
        totalCount: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    };
  },

  async getDetail(notificationId) {
    if (notificationId !== adminNotificationDetailFixture.notificationId) {
      throw notificationApiErrorFixtures.ADMIN_NOTIFICATION_NOT_FOUND();
    }
    return cloneFixture(adminNotificationDetailFixture);
  },
};
