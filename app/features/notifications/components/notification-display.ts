import type {
  NotificationFormErrors,
  NotificationFormIssue,
} from "~/features/notifications/hooks/notification-form-errors";
import type {
  NotificationDraftField,
  NotificationDraftIssue,
} from "~/features/notifications/model/notification-draft-validation";
export type NotificationDisplayedErrors = Partial<
  Record<NotificationDraftField, string>
>;

export const notificationImportanceLabels = {
  low: "低",
  normal: "通常",
  high: "高",
};
export const notificationAudienceLabels = {
  all: "全員",
  user: "ユーザー",
  class_room: "クラス",
  gathering: "集合",
  event: "イベント",
};
export const notificationUserCategoryLabels = {
  student: "生徒",
  teacher: "先生",
  student_and_teacher: "生徒・先生",
};

const validationMessages: Record<NotificationDraftIssue, string> = {
  detail_title_required: "詳細タイトルを入力してください",
  detail_body_required: "詳細本文を入力してください",
  title_required: "タイトルを入力してください",
  body_required: "本文を入力してください",
  schedule_required: "予約配信日時を指定してください",
  schedule_invalid: "予約配信日時が正しくありません",
  schedule_not_future: "現在より後の日時を指定してください",
  audience_required: "通知対象を1件以上指定してください",
  audience_target_required: "通知対象を選択してください",
  audience_duplicate: "同じ通知対象が重複しています",
  audience_all_exclusive: "全体は他の通知対象と同時に指定できません",
};

/** 業務検証のコードを表示文言へ変換し、サーバーの文言は保持する。 */
export function formatNotificationDraftErrors(
  errors: NotificationFormErrors
): NotificationDisplayedErrors {
  return Object.fromEntries(
    Object.entries(errors).map(([field, error]) => [
      field,
      error
        ? error.kind === "validation"
          ? validationMessages[error.code]
          : error.message
        : undefined,
    ])
  );
}

export function formatNotificationDateTime(
  value: string | Date | undefined,
  fallback = "-"
): string {
  if (!value) return fallback;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Tokyo",
      }).format(date);
}

const apiErrorGroupLabels: Record<string, string> = {
  content: "通知内容",
  schedule: "通知対象・配信日時",
};
export function formatNotificationSubmissionErrors(
  issues: readonly NotificationFormIssue[],
  fallback: string | null
): string | null {
  if (!issues.length) return fallback;
  return issues
    .map(({ field, message }) =>
      field && apiErrorGroupLabels[field]
        ? `${apiErrorGroupLabels[field]}: ${message}`
        : message
    )
    .join(" / ");
}
