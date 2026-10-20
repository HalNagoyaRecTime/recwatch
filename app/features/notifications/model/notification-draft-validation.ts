import type { NotificationDraft } from "~/features/notifications/model/notification-draft";

export type NotificationDraftErrors = Partial<
  Record<keyof NotificationDraft | `audiences.${number}`, string>
>;

export function validateNotificationDraft(
  draft: NotificationDraft,
  now = new Date(),
  detailOnly = false
): NotificationDraftErrors {
  const errors: NotificationDraftErrors = {};

  if (!draft.detailTitle.trim()) {
    errors.detailTitle = "詳細タイトルを入力してください";
  }

  if (!draft.detailBody.trim()) {
    errors.detailBody = "詳細本文を入力してください";
  }

  if (detailOnly) return errors;

  if (!draft.title.trim()) {
    errors.title = "タイトルを入力してください";
  }

  if (!draft.body.trim()) {
    errors.body = "本文を入力してください";
  }

  Object.assign(errors, validateNotificationAudiences(draft.audiences));

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

export function validateNotificationAudiences(
  audiences: NotificationDraft["audiences"]
): NotificationDraftErrors {
  const errors: NotificationDraftErrors = {};
  if (audiences.length === 0)
    errors.audiences = "通知対象を1件以上指定してください";
  const seen = new Set<string>();
  audiences.forEach((audience, index) => {
    const targetId = Number(audience.targetId);
    if (
      audience.type !== "all" &&
      (!Number.isSafeInteger(targetId) || targetId <= 0)
    ) {
      errors[`audiences.${index}`] = "通知対象を選択してください";
      return;
    }
    const key =
      audience.type === "all" ? "all" : `${audience.type}:${targetId}`;
    if (seen.has(key))
      errors[`audiences.${index}`] = "同じ通知対象が重複しています";
    seen.add(key);
  });
  if (
    audiences.some((audience) => audience.type === "all") &&
    audiences.length > 1
  )
    errors.audiences = "全体は他の通知対象と同時に指定できません";
  return errors;
}
