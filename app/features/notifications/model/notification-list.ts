import type { ManagedNotificationStatus } from "~/features/notifications/model/notification";

export type NotificationDeliveryStatus = ManagedNotificationStatus;

export type NotificationListItem = {
  audience: string;
  canModify: boolean;
  competition: string;
  deliveredAt: string;
  id: string;
  schedule: string;
  sender: string;
  status: NotificationDeliveryStatus;
  title: string;
};

export const notificationListPageSize = 20;

export const notificationSortableColumnIds = [
  "id",
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
