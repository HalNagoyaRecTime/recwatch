import type {
  NotificationCreationDto,
  NotificationImportanceDto,
  NotificationPlatformDto,
  NotificationPushDeliveryStatusDto,
  NotificationScheduleStatusDto,
  NotificationStopDto,
} from "~/features/notifications/api/dto/notification-common-dto";

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
  resolving: "対象解決中",
  sending: "送信中",
  completed: "完了",
  failed: "失敗",
  stopped: "停止済み",
} satisfies Record<NotificationScheduleStatusDto, string>;

export const deliveryStatusLabel = {
  pending: "送信待ち",
  sending: "送信中",
  retry_wait: "再送待ち",
  sent: "FCM受付成功",
  failed: "失敗",
  stopped: "停止済み",
} satisfies Record<NotificationPushDeliveryStatusDto, string>;

export const platformLabel = {
  ios: "iOS",
  android: "Android",
} satisfies Record<NotificationPlatformDto, string>;

export const importanceLabel = {
  low: "低",
  normal: "通常",
  high: "高",
} satisfies Record<NotificationImportanceDto, string>;

export function formatCreation(creation: NotificationCreationDto) {
  if (creation.method === "manual") {
    return `手動通知・${creation.user?.userName ?? "作成者不明"}`;
  }
  return `自動通知・${creation.source.label ?? "削除済み"}`;
}

export function formatStop(stop: NotificationStopDto | null) {
  if (!stop) return "—";
  const reason = stop.reason === "source_deleted" ? "配信元削除" : "手動停止";
  const stoppedBy = stop.stoppedBy?.userName ?? "システム";
  return `${reason}・${formatNotificationDetailDateTime(stop.stoppedAt)}・停止者: ${stoppedBy}`;
}
