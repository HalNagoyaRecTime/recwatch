import type { NotificationConfigApi } from "~/features/notifications/api/contracts/notification-config-api";
import {
  cloneFixture,
  notificationConfigFixture,
} from "~/features/notifications/mock/notification-fixtures";

export const mockNotificationConfigApi: NotificationConfigApi = {
  async getConfig() {
    return cloneFixture(notificationConfigFixture);
  },

  async getAudienceCount() {
    return { recipientCount: 42 };
  },
};
