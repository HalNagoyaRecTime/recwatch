import type { NotificationListItem } from "~/features/notifications/model/notification-list-item";

export const notificationSortableColumnIds = [
  "title",
  "audience",
  "deliveredAt",
  "sender",
  "competition",
  "schedule",
  "status",
] as const satisfies readonly (keyof NotificationListItem)[];

export type NotificationSortableColumnId =
  (typeof notificationSortableColumnIds)[number];

export type NotificationListSortDirection = "asc" | "desc";

export type NotificationListSort = {
  columnId: NotificationSortableColumnId;
  direction: NotificationListSortDirection;
};

export function parseNotificationListSort(
  searchParams: URLSearchParams
): NotificationListSort | undefined {
  const columnId = searchParams.get("sort");
  const direction = searchParams.get("order");

  if (
    !isNotificationSortableColumnId(columnId) ||
    (direction !== "asc" && direction !== "desc")
  ) {
    return undefined;
  }

  return { columnId, direction };
}

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
