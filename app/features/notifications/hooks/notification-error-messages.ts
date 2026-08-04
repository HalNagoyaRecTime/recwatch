import type { NotificationAudienceLoadingErrorKind } from "~/features/notifications/api/contracts/errors/notification-audience-loading-error";
import type { NotificationManagementErrorKind } from "~/features/notifications/api/contracts/errors/notification-management-error";
import type { NotificationSubmissionErrorKind } from "~/features/notifications/api/contracts/errors/notification-submission-error";

const notificationAudienceLoadingErrorMessages: Record<
  NotificationAudienceLoadingErrorKind,
  string
> = {
  authentication_required: "ログインが必要です。",
  forbidden: "通知対象を取得する権限がありません。",
  unexpected:
    "通知対象を取得できませんでした。時間をおいて再度お試しください。",
};

const notificationManagementErrorMessages: Record<
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

const notificationSubmissionErrorMessages: Record<
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

export function getNotificationAudienceLoadingErrorMessage(
  kind: NotificationAudienceLoadingErrorKind
) {
  return notificationAudienceLoadingErrorMessages[kind];
}

export function getNotificationManagementErrorMessage(
  kind: NotificationManagementErrorKind
) {
  return notificationManagementErrorMessages[kind];
}

export function getNotificationSubmissionErrorMessage(
  kind: NotificationSubmissionErrorKind
) {
  return notificationSubmissionErrorMessages[kind];
}
