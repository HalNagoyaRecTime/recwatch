export const notificationListPageSize = 20;

export const notificationSortableColumnIds = [
  "notificationId",
  "title",
  "audience",
  "sendAt",
  "creationMethod",
  "creator",
  "importance",
  "status",
] as const;

export type NotificationSortableColumnId =
  (typeof notificationSortableColumnIds)[number];

export type NotificationListSortDirection = "asc" | "desc";

export type NotificationListSort = {
  columnId: NotificationSortableColumnId;
  direction: NotificationListSortDirection;
};

export type NotificationCreationMethodFilter = "all" | "manual" | "automatic";

export function getNextNotificationListSort(
  current: NotificationListSort | undefined,
  columnId: NotificationSortableColumnId
): NotificationListSort {
  if (current?.columnId === columnId && current.direction === "asc") {
    return { columnId, direction: "desc" };
  }

  return { columnId, direction: "asc" };
}

export function isNotificationSortableColumnId(
  value: string | null
): value is NotificationSortableColumnId {
  return notificationSortableColumnIds.some((columnId) => columnId === value);
}
