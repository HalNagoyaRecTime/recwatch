import type { NotificationDraft } from "../model/notification-draft";

export type NotificationSubmission = {
  draftId: string;
};

export interface NotificationSubmitter {
  submit(draft: NotificationDraft): Promise<NotificationSubmission>;
}
