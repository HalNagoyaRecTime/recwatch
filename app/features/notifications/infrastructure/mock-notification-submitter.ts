import type {
  NotificationSubmission,
  NotificationSubmitter,
} from "~/features/notifications/application/notification-submitter";

export const mockNotificationSubmitter: NotificationSubmitter = {
  async submit(): Promise<NotificationSubmission> {
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    return {
      notificationId: 1,
      scheduleCount: 1,
      status: "draft",
    };
  },
};
