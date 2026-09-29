import type {
  AdminNotificationListItem,
  AdminNotificationListSchedule,
} from "~/features/notifications/api/contracts/admin-notification-query-api";

export function formatNotificationDateTime(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatNotificationAudience(
  schedule: AdminNotificationListSchedule | undefined
) {
  if (!schedule || schedule.audience.items.length === 0) return "—";
  return schedule.audience.items
    .map((item) => (item.type === "all" ? "全体" : (item.label ?? "削除済み")))
    .join("、");
}

export function formatNotificationCreationMethod(
  notification: AdminNotificationListItem
) {
  return notification.creation.method === "manual" ? "手動" : "自動";
}

export function formatNotificationCreator(
  notification: AdminNotificationListItem
) {
  if (notification.creation.method === "manual") {
    return notification.creation.user?.userName ?? "不明";
  }
  return notification.creation.source.label ?? "削除済み";
}

export function formatNotificationImportance(
  importance: AdminNotificationListItem["importance"]
) {
  switch (importance) {
    case "low":
      return "低";
    case "normal":
      return "通常";
    case "high":
      return "高";
  }
}
