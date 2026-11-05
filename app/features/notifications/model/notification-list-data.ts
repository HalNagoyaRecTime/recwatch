import type {
  NotificationListRecord,
  NotificationListSchedule,
  NotificationCreationMethodFilter,
  NotificationListFilters,
  NotificationListSort,
} from "~/features/notifications/model/notification-list";

export function filterNotificationList<T extends NotificationListRecord>(
  items: readonly T[],
  creationMethod: NotificationCreationMethodFilter,
  filters: NotificationListFilters | undefined,
  now: number
) {
  const words =
    filters?.search
      .trim()
      .toLocaleLowerCase("ja")
      .split(/\s+/)
      .filter(Boolean) ?? [];
  return items.filter((item) => {
    if (creationMethod !== "all" && item.creation.method !== creationMethod)
      return false;
    if (!filters) return true;
    const haystack = [
      String(item.notificationId),
      `#${item.notificationId}`,
      item.content.push.title,
      item.content.push.body,
      item.creation.user?.userName,
      item.creation.source?.label,
      ...item.schedules.flatMap((schedule) =>
        schedule.audience.items.map((audience) =>
          "label" in audience ? audience.label : ""
        )
      ),
    ]
      .join(" ")
      .toLocaleLowerCase("ja");
    if (!words.every((word) => haystack.includes(word))) return false;
    return (
      item.schedules.some((schedule) =>
        matchesNotificationSchedule(schedule, filters, now)
      ) ||
      (item.schedules.length === 0 &&
        filters.status === "all" &&
        filters.dateMode === "all")
    );
  });
}

export function matchesNotificationSchedule(
  schedule: NotificationListSchedule,
  filters: NotificationListFilters,
  now: number
) {
  if (filters.status !== "all" && schedule.status !== filters.status)
    return false;
  if (filters.dateMode === "all") return true;
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  });
  const day = formatter.format(new Date(schedule.sendAt));
  if (filters.dateMode === "today")
    return day === formatter.format(new Date(now));
  if (filters.dateMode === "date") return !filters.from || day === filters.from;
  return (
    (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to)
  );
}

export function sortNotificationList<T extends NotificationListRecord>(
  items: readonly T[],
  sort: NotificationListSort | undefined,
  filters: NotificationListFilters | undefined,
  now: number
) {
  if (!sort) return items;

  const collator = new Intl.Collator("ja", {
    numeric: true,
    sensitivity: "base",
  });

  return [...items].sort((left, right) => {
    const result = collator.compare(
      getSortValue(left, sort.columnId, filters, now),
      getSortValue(right, sort.columnId, filters, now)
    );
    return sort.direction === "asc" ? result : -result;
  });
}

export function selectRepresentativeSchedule<
  T extends NotificationListSchedule,
>(
  notification: { schedules: readonly T[] },
  now: number,
  filters?: NotificationListFilters
): T | undefined {
  const schedules = notification.schedules
    .filter(
      (schedule) =>
        !filters || matchesNotificationSchedule(schedule, filters, now)
    )
    .sort((left, right) => Date.parse(left.sendAt) - Date.parse(right.sendAt));
  const nextSchedule = schedules.find(
    (schedule) => Date.parse(schedule.sendAt) >= now
  );
  return nextSchedule ?? schedules.at(-1);
}

function getSortValue(
  item: NotificationListRecord,
  columnId: NotificationListSort["columnId"],
  filters: NotificationListFilters | undefined,
  now: number
) {
  const schedule = selectRepresentativeSchedule(item, now, filters);

  switch (columnId) {
    case "notificationId":
      return String(item.notificationId).padStart(16, "0");
    case "title":
      return item.content.push.title;
    case "audience":
      return (schedule?.audience.items ?? [])
        .map((audience) =>
          "label" in audience ? (audience.label ?? "") : audience.type
        )
        .join("、");
    case "sendAt":
      return schedule?.sendAt ?? "";
    case "creator":
      return item.creation.method === "manual"
        ? (item.creation.user?.userName ?? "")
        : (item.creation.source?.label ?? "");
    case "status":
      return schedule?.status ?? "";
  }
}

export function canDeleteNotification(notification: NotificationListRecord) {
  return (
    notification.creation.method === "manual" &&
    notification.schedules.every((schedule) => schedule.status === "scheduled")
  );
}
