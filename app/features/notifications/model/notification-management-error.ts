export type NotificationManagementErrorKind =
  | "invalid_request"
  | "authentication_required"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "unexpected";

export class NotificationManagementError extends Error {
  constructor(public readonly kind: NotificationManagementErrorKind) {
    super(kind);
    this.name = "NotificationManagementError";
  }
}

export const notificationManagementErrorMessages: Record<
  NotificationManagementErrorKind,
  string
> = {
  invalid_request: "入力内容を確認してください。",
  authentication_required: "ログインが必要です。",
  forbidden: "通知を管理する権限がありません。",
  not_found: "対象の通知が見つかりません。",
  conflict:
    "通知の配信状態が変更されました。一覧を再読み込みして確認してください。",
  unexpected: "通知を操作できませんでした。時間をおいて再度お試しください。",
};
