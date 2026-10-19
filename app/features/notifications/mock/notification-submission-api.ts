import type {
  NotificationSubmission,
  NotificationSubmissionApi,
} from "~/features/notifications/api/contracts/notification-submission-api";

export const mockNotificationSubmissionApi: NotificationSubmissionApi = {
  async submit(): Promise<NotificationSubmission> {
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    return {
      notificationId: 1,
      scheduleCount: 1,
      status: "draft",
    };
  },
};
