import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

export type NotificationDraftErrors = Partial<
  Record<keyof NotificationDraft, string>
>;

export function validateNotificationDraft(
  draft: NotificationDraft,
  now = new Date()
): NotificationDraftErrors {
  const errors: NotificationDraftErrors = {};

  if (
    draft.pushTitle !== undefined ||
    draft.pushBody !== undefined ||
    draft.markdownDescription !== undefined
  ) {
    if (!draft.pushTitle?.trim()) {
      errors.pushTitle = "プッシュ通知タイトルを入力してください";
    }

    if (!draft.pushBody?.trim()) {
      errors.pushBody = "プッシュ通知本文を入力してください";
    }

    if (!draft.title.trim()) {
      errors.title = "タイトルを入力してください";
    }

    if (!draft.markdownDescription?.trim()) {
      errors.markdownDescription = "Markdown説明を入力してください";
    }

    if (!draft.importance) {
      errors.importance = "通知の重要度を選択してください";
    }
  } else {
    if (!draft.title.trim()) {
      errors.title = "タイトルを入力してください";
    }

    if (!draft.body.trim()) {
      errors.body = "本文を入力してください";
    }
  }

  const audienceScope =
    draft.audienceScope ?? (draft.audienceType === "all" ? "all" : "specified");

  if (
    audienceScope === "specified" &&
    draft.targetSelections !== undefined &&
    draft.targetSelections.length === 0
  ) {
    errors.audienceId = "通知対象を選択してください";
  } else if (
    draft.audienceScope === undefined &&
    draft.audienceType !== "all" &&
    !draft.audienceId
  ) {
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
