import {
  EventNotificationError,
  type EventNotificationErrorKind,
} from "./event-notification-error";

export type EventNotificationErrorContext =
  | "list"
  | "detail"
  | "notification"
  | "submission";

const messagesByContext: Record<
  EventNotificationErrorContext,
  Record<EventNotificationErrorKind, string>
> = {
  list: {
    invalid_request: "イベントの入力内容を確認してください。",
    authentication_required: "ログインが必要です。",
    forbidden: "イベントを取得する権限がありません。",
    not_found: "対象のイベントが見つかりません。",
    conflict:
      "イベントまたは通知の状態が変更されました。再読み込みして確認してください。",
    unexpected:
      "イベントを取得できませんでした。時間をおいて再度お試しください。",
  },
  detail: {
    invalid_request: "イベントの入力内容を確認してください。",
    authentication_required: "ログインが必要です。",
    forbidden: "イベントを取得する権限がありません。",
    not_found: "対象のイベントが見つかりません。",
    conflict:
      "イベントまたは通知の状態が変更されました。再読み込みして確認してください。",
    unexpected: "イベントの詳細を取得できませんでした。",
  },
  notification: {
    invalid_request: "通知予定の内容を確認してください。",
    authentication_required: "ログインが必要です。",
    forbidden: "通知予定を操作する権限がありません。",
    not_found: "対象のイベントまたは通知予定が見つかりません。",
    conflict:
      "イベントまたは通知の状態が変更されました。再読み込みして確認してください。",
    unexpected:
      "通知予定を削除できませんでした。最新の状態を確認して再度お試しください。",
  },
  submission: {
    invalid_request: "イベントの入力内容を確認してください。",
    authentication_required: "ログインが必要です。",
    forbidden: "イベントを更新する権限がありません。",
    not_found: "対象のイベントが見つかりません。",
    conflict:
      "イベントまたは通知の状態が変更されました。再読み込みして確認してください。",
    unexpected:
      "イベントを登録できませんでした。時間をおいて再度お試しください。",
  },
};

export function getEventNotificationErrorMessage(
  error: unknown,
  context: EventNotificationErrorContext
) {
  const kind: EventNotificationErrorKind =
    error instanceof EventNotificationError ? error.kind : "unexpected";

  return messagesByContext[context][kind];
}
