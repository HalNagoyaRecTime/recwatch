import type {
  NotificationCreation,
  NotificationImportance,
  NotificationPlatform,
  NotificationPushDeliveryStatus,
  NotificationScheduleStatus,
  NotificationStop,
} from "~/features/notifications/api/contracts/admin-notification-types";

export function formatNotificationDetailDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export const scheduleStatusLabel = {
  scheduled: "配信予定",
  resolving: "対象者確定中",
  sending: "送信中",
  completed: "完了",
  failed: "失敗",
  stopped: "停止済み",
} satisfies Record<NotificationScheduleStatus, string>;

export const deliveryStatusLabel = {
  pending: "送信待ち",
  sending: "送信中",
  retry_wait: "再送待ち",
  sent: "通知サービス受付済み",
  failed: "失敗",
  stopped: "停止済み",
} satisfies Record<NotificationPushDeliveryStatus, string>;

export function formatNotificationDeliveryFailure(
  reason: string | null
): string {
  switch (reason) {
    case null:
      return "—";
    case "UNREGISTERED":
      return "通知先端末の登録が無効です";
    case "INVALID_ARGUMENT":
      return "通知の送信情報が正しくありません";
    case "SENDER_ID_MISMATCH":
      return "通知の送信元と通知先端末の登録情報が一致しません";
    case "QUOTA_EXCEEDED":
      return "通知の送信上限を超えています";
    case "INTERNAL":
      return "通知サービスで内部エラーが発生しました";
    case "UNAVAILABLE":
      return "通知サービスを一時的に利用できません";
    default:
      return reason;
  }
}

export const platformLabel = {
  ios: "iOS",
  android: "Android",
} satisfies Record<NotificationPlatform, string>;

export const importanceLabel = {
  low: "低",
  normal: "通常",
  high: "高",
} satisfies Record<NotificationImportance, string>;

export function formatCreation(creation: NotificationCreation) {
  if (creation.method === "manual") {
    return `手動通知・${creation.user?.userName ?? "作成者不明"}`;
  }
  return `自動通知・${creation.source.label ?? "削除済み"}`;
}

export function formatStop(stop: NotificationStop | null) {
  if (!stop) return "—";
  const reason = stop.reason === "source_deleted" ? "配信元削除" : "手動停止";
  const stoppedBy =
    stop.stoppedBy?.userName ??
    (stop.reason === "manual" ? "削除済みユーザー" : "システム");
  return `${reason}・${formatNotificationDetailDateTime(stop.stoppedAt)}・停止者: ${stoppedBy}`;
}
