import type {
  AdminNotificationListItem,
  AdminNotificationListSchedule,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import type {
  NotificationCreationMethodFilter,
  NotificationListSort,
} from "~/features/notifications/model/notification-list";

export function filterNotificationList(
  items: readonly AdminNotificationListItem[],
  creationMethod: NotificationCreationMethodFilter
) {
  if (creationMethod === "all") return items;
  return items.filter((item) => item.creation.method === creationMethod);
}

export function sortNotificationList(
  items: readonly AdminNotificationListItem[],
  sort: NotificationListSort | undefined
) {
  if (!sort) return items;

  const collator = new Intl.Collator("ja", {
    numeric: true,
    sensitivity: "base",
  });

  return [...items].sort((left, right) => {
    const result = collator.compare(
      getSortValue(left, sort.columnId),
      getSortValue(right, sort.columnId)
    );
    return sort.direction === "asc" ? result : -result;
  });
}

export function selectRepresentativeSchedule(
  notification: AdminNotificationListItem,
  now = Date.now()
): AdminNotificationListSchedule | undefined {
  const schedules = [...notification.schedules].sort(
    (left, right) => Date.parse(left.sendAt) - Date.parse(right.sendAt)
  );
  const nextSchedule = schedules.find(
    (schedule) => Date.parse(schedule.sendAt) >= now
  );
  return nextSchedule ?? schedules.at(-1);
}

export function canModifyNotification(notification: AdminNotificationListItem) {
  return (
    notification.schedules.length > 0 &&
    notification.schedules.every((schedule) => schedule.status === "scheduled")
  );
}

function getSortValue(
  item: AdminNotificationListItem,
  columnId: NotificationListSort["columnId"]
) {
  const schedule = selectRepresentativeSchedule(item);

  switch (columnId) {
    case "notificationId":
      return String(item.notificationId).padStart(16, "0");
    case "title":
      return item.content.push.title;
    case "audience":
      return (schedule?.audience.items ?? [])
        .map((audience) =>
          audience.type === "all" ? "全体" : (audience.label ?? "削除済み")
        )
        .join("、");
    case "sendAt":
      return schedule?.sendAt ?? "";
    case "creationMethod":
      return item.creation.method;
    case "creator":
      return item.creation.method === "manual"
        ? (item.creation.user?.userName ?? "")
        : (item.creation.source.label ?? "");
    case "importance":
      return item.importance;
    case "status":
      return schedule?.status ?? "";
  }
}
