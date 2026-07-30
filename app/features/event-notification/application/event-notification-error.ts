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
  invalid_request: "競技の入力内容を確認してください。",
  authentication_required: "ログインが必要です。",
  forbidden: "競技を更新する権限がありません。",
  not_found: "対象の競技が見つかりません。",
  conflict:
    "競技または通知の状態が変更されました。再読み込みして確認してください。",
  unexpected: "競技を更新できませんでした。時間をおいて再度お試しください。",
};
