import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

export type NotificationSubmission = {
  notificationId: number;
  scheduleCount: number;
  status: "draft";
};

export interface NotificationSubmissionApi {
  submit(draft: NotificationDraft): Promise<NotificationSubmission>;
}
