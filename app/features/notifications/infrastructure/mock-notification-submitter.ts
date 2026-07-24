import type {
  NotificationSubmission,
  NotificationSubmitter,
} from "../application/notification-submitter";

export const mockNotificationSubmitter: NotificationSubmitter = {
  async submit(): Promise<NotificationSubmission> {
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    return { draftId: crypto.randomUUID() };
  },
};
