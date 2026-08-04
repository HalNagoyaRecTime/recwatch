import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

export type NotificationDraftErrors = Partial<
  Record<keyof NotificationDraft, string>
>;

export function validateNotificationDraft(
  draft: NotificationDraft
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
    } else if (Number.isNaN(new Date(draft.scheduledAt).getTime())) {
      errors.scheduledAt = "予約配信日時が正しくありません";
    }
  }

  return errors;
}
