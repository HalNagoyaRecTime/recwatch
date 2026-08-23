export type EventNotificationErrorKind =
  | "invalid_request"
  | "authentication_required"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "unexpected";

export class EventNotificationError extends Error {
  constructor(public readonly kind: EventNotificationErrorKind) {
    super(kind);
    this.name = "EventNotificationError";
  }
}

export const eventNotificationErrorMessages: Record<
  EventNotificationErrorKind,
  string
> = {
  invalid_request: "イベントの入力内容を確認してください。",
  authentication_required: "ログインが必要です。",
  forbidden: "イベントを更新する権限がありません。",
  not_found: "対象のイベントが見つかりません。",
  conflict:
    "イベントまたは通知の状態が変更されました。再読み込みして確認してください。",
  unexpected:
    "イベントを更新できませんでした。時間をおいて再度お試しください。",
};
