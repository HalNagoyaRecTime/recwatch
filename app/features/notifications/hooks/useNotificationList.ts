import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type { AdminNotificationQueryApi } from "~/features/notifications/api/contracts/admin-notification-query-api";
import type { AdminNotificationListItem } from "~/features/notifications/model/admin-notification";
import { getErrorMessage } from "~/lib/client-error";
import {
  getNextNotificationListSort,
  isNotificationSortableColumnId,
  notificationListPageSize,
  type NotificationListItem,
  type NotificationListSort,
} from "~/features/notifications/model/notification-list";
import {
  reportNotificationActionError,
  reportNotificationBackgroundError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";

type UseNotificationListOptions = {
  commandApi: AdminNotificationCommandApi;
  queryApi: AdminNotificationQueryApi;
  reportFeedback?: NotificationFeedbackReporter;
};

export function useNotificationList({
  commandApi,
  queryApi,
  reportFeedback,
}: UseNotificationListOptions) {
  const [notifications, setNotifications] = useState<
    AdminNotificationListItem[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<NotificationListSort>();
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const load = useCallback(
    async (background = false) => {
      const requestId = ++requestSequence.current;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await queryApi.list();
        if (requestId !== requestSequence.current) return;
        setNotifications(result.items);
      } catch (error) {
        if (requestId !== requestSequence.current) return;
        setNotifications([]);
        const message = getErrorMessage(error);
        setErrorMessage(message);
        if (background) {
          reportNotificationBackgroundError(reportFeedback, {
            title: "通知一覧を更新できませんでした",
            message,
            action: "notification.list.reload",
            endpoint: "/api/v1/admin/notifications",
            error,
          });
        }
      } finally {
        if (requestId === requestSequence.current) setIsLoading(false);
      }
    },
    [queryApi, reportFeedback]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const allItems = useMemo(
    () => sortItems(notifications.map(toListItem), sort),
    [notifications, sort]
  );
  const pageCount = Math.max(
    1,
    Math.ceil(allItems.length / notificationListPageSize)
  );
  const items = allItems.slice(
    (currentPage - 1) * notificationListPageSize,
    currentPage * notificationListPageSize
  );

  function handleSortChange(columnId: string) {
    if (!isNotificationSortableColumnId(columnId)) return;
    setSort((current) => getNextNotificationListSort(current, columnId));
  }

  function handleDeleteRequest(item: NotificationListItem) {
    setSelectedNotification(item);
  }

  async function handleDelete() {
    if (!selectedNotification || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await commandApi.delete(Number(selectedNotification.id));
      setSelectedNotification(null);
      await load(true);
      reportFeedback?.({
        kind: "action-success",
        title: "通知を削除しました",
        message: "未送信の通知を削除しました。",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      setSelectedNotification(null);
      reportNotificationActionError(reportFeedback, {
        title: "通知を削除できませんでした",
        message,
        action: "notification.delete",
        endpoint: `/api/v1/admin/notifications/${selectedNotification.id}`,
        error,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    closeDeleteDialog: () => setSelectedNotification(null),
    confirmDelete: handleDelete,
    currentPage,
    errorMessage,
    isDeleting,
    isLoading,
    items,
    onDeleteRequest: handleDeleteRequest,
    onPageChange: setCurrentPage,
    onSortChange: handleSortChange,
    pageCount,
    reload: () => load(true),
    selectedNotification,
    sort,
    totalItems: allItems.length,
  };
}

function formatDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ja-JP", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    hour12: false,
  }).format(date);
}

function toListItem(
  notification: AdminNotificationListItem
): NotificationListItem {
  const schedule = notification.schedules[0];
  const audienceLabels = schedule?.audience.items.map((item) => {
    if (item.type === "all") return "全体";
    return item.label ?? "削除済み";
  });
  const sourceLabel =
    notification.creation.method === "automatic"
      ? (notification.creation.source.label ?? "削除済み")
      : "—";

  return {
    audience: audienceLabels?.join("、") || "—",
    canModify:
      notification.schedules.length > 0 &&
      notification.schedules.every((item) => item.status === "scheduled"),
    competition: sourceLabel,
    deliveredAt: formatDate(schedule?.sendAt),
    id: String(notification.notificationId),
    schedule: formatDate(schedule?.sendAt),
    sender:
      notification.creation.method === "manual"
        ? (notification.creation.user?.userName ?? "—")
        : sourceLabel,
    status: schedule?.status ?? null,
    title: notification.content.push.title,
  };
}

function sortItems(
  items: readonly NotificationListItem[],
  sort: NotificationListSort | undefined
) {
  if (!sort) return items;

  const collator = new Intl.Collator("ja", {
    numeric: true,
    sensitivity: "base",
  });

  return [...items].sort((left, right) => {
    const result = collator.compare(
      String(left[sort.columnId] ?? ""),
      String(right[sort.columnId] ?? "")
    );
    return sort.direction === "asc" ? result : -result;
  });
}
