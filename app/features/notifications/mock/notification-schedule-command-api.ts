import type { NotificationScheduleCommandApi } from "~/features/notifications/api/contracts/notification-schedule-command-api";

export const mockNotificationScheduleCommandApi: NotificationScheduleCommandApi =
  {
    async cancel() {},
    async resend() {
      return { notificationId: 108, notificationScheduleId: 509 };
    },
    async stop(notificationScheduleId) {
      return { notificationScheduleId, status: "stopped" };
    },
  };
