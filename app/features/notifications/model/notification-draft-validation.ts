import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

export type NotificationDraftErrors = Partial<
  Record<keyof NotificationDraft, string>
>;

export function validateNotificationDraft(
  draft: NotificationDraft,
  now = new Date()
): NotificationDraftErrors {
  const errors: NotificationDraftErrors = {};

  if (!draft.title.trim()) {
    errors.title = "タイトルを入力してください";
  }

  if (!draft.body.trim()) {
    errors.body = "本文を入力してください";
  }

  if (draft.audienceType !== "all" && !draft.audienceId) {
    errors.audienceId = "通知対象を選択してください";
  }

  if (draft.deliveryTiming === "scheduled") {
    if (!draft.scheduledAt) {
      errors.scheduledAt = "予約配信日時を指定してください";
    } else {
      const scheduledAt = new Date(draft.scheduledAt);

      if (Number.isNaN(scheduledAt.getTime())) {
        errors.scheduledAt = "予約配信日時が正しくありません";
      } else if (scheduledAt <= now) {
        errors.scheduledAt = "現在より後の日時を指定してください";
      }
    }
  }

  return errors;
}
