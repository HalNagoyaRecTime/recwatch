import type { NotificationDraft } from "../model/notification-draft";

export type NotificationSubmission = {
  notificationId: number;
  scheduleCount: number;
  status: "draft";
};

export interface NotificationSubmitter {
  submit(draft: NotificationDraft): Promise<NotificationSubmission>;
}
