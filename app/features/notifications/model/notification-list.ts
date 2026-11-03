import type { NOTIFICATION_SCHEDULE_STATUSES } from "~/features/notifications/model/notification-values";

export type NotificationListSchedule = {
  sendAt: string;
  status: (typeof NOTIFICATION_SCHEDULE_STATUSES)[number];
  audience: {
    items: ({ type: "all" } | { type: string; label: string | null })[];
  };
};

/** 検索・並べ替え・操作可否の判定に必要な値。 */
export type NotificationListRecord = {
  notificationId: number;
  content: { push: { title: string; body: string } };
  importance: string;
  creation: {
    method: "manual" | "automatic";
    user: { userName: string } | null;
    source: { label: string | null } | null;
  };
  schedules: NotificationListSchedule[];
};

export const notificationListPageSize = 50;

export const notificationSortableColumnIds = [
  "notificationId",
  "title",
  "audience",
  "sendAt",
  "creator",
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

export type NotificationListFilters = {
  search: string;
  status: "all" | (typeof NOTIFICATION_SCHEDULE_STATUSES)[number];
  dateMode: "all" | "today" | "date" | "range";
  from: string;
  to: string;
};

export const defaultNotificationListFilters: NotificationListFilters = {
  search: "",
  status: "all",
  dateMode: "all",
  from: "",
  to: "",
};
