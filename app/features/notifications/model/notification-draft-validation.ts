import type { NotificationDraft } from "./notification-draft";

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

  return errors;
}
