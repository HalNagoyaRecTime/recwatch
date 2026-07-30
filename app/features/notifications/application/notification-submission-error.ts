export type NotificationSubmissionErrorKind =
  | "invalid_request"
  | "authentication_required"
  | "forbidden"
  | "audience_not_found"
  | "no_active_devices"
  | "unexpected";

export class NotificationSubmissionError extends Error {
  constructor(public readonly kind: NotificationSubmissionErrorKind) {
    super(kind);
    this.name = "NotificationSubmissionError";
  }
}

export const notificationSubmissionErrorMessages: Record<
  NotificationSubmissionErrorKind,
  string
> = {
  invalid_request: "入力内容または配信日時を確認してください。",
  authentication_required: "ログインが必要です。",
  forbidden: "通知を作成する権限がありません。",
  audience_not_found: "選択した通知対象が見つかりません。",
  no_active_devices: "通知対象に有効な端末がありません。",
  unexpected: "通知の作成に失敗しました。時間をおいて再度お試しください。",
};
