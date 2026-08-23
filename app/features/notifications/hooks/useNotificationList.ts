import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { NotificationManagementApi } from "~/features/notifications/api/contracts/notification-management-api";
import { NotificationManagementError } from "~/features/notifications/api/contracts/errors/notification-management-error";
import { getNotificationManagementErrorMessage } from "~/features/notifications/hooks/notification-error-messages";
import {
  canModifyNotification,
  type ManagedNotification,
} from "~/features/notifications/model/notification";
import {
  getNextNotificationListSort,
  isNotificationSortableColumnId,
  notificationListPageSize,
  type NotificationListItem,
  type NotificationListSort,
} from "~/features/notifications/model/notification-list";

type UseNotificationListOptions = {
  api: NotificationManagementApi;
};

export function useNotificationList({ api }: UseNotificationListOptions) {
  const [notifications, setNotifications] = useState<ManagedNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<NotificationListSort>();
  const [selectedNotification, setSelectedNotification] =
    useState<ManagedNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const loadPage = useCallback(
    async (page: number) => {
      const requestId = ++requestSequence.current;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await api.list({
          limit: notificationListPageSize,
          offset: (page - 1) * notificationListPageSize,
        });
        if (requestId !== requestSequence.current) {
          return;
        }
        setNotifications(result.notifications);
        setTotal(result.total);
      } catch (error) {
        if (requestId !== requestSequence.current) {
          return;
        }
        setNotifications([]);
        setTotal(0);
        setErrorMessage(toErrorMessage(error));
      } finally {
        if (requestId === requestSequence.current) {
          setIsLoading(false);
        }
      }
    },
    [api]
  );

  useEffect(() => {
    void Promise.resolve().then(() => loadPage(currentPage));
  }, [currentPage, loadPage]);

  const reload = useCallback(
    () => loadPage(currentPage),
    [currentPage, loadPage]
  );

  const items = useMemo(
    () => sortItems(notifications.map(toListItem), sort),
    [notifications, sort]
  );

  const pageCount = Math.max(1, Math.ceil(total / notificationListPageSize));

  function handleSortChange(columnId: string) {
    if (!isNotificationSortableColumnId(columnId)) {
      return;
    }

    setSort((current) => getNextNotificationListSort(current, columnId));
  }

  function handleDeleteRequest(item: NotificationListItem) {
    const notification = notifications.find(
      (candidate) => String(candidate.id) === item.id
    );
    if (notification) {
      setSelectedNotification(notification);
    }
  }

  async function handleDelete() {
    if (!selectedNotification || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await api.delete(selectedNotification.id);
      setSelectedNotification(null);
      const nextPage =
        currentPage > 1 && notifications.length === 1
          ? currentPage - 1
          : currentPage;
      setCurrentPage(nextPage);
      await loadPage(nextPage);
    } catch (error) {
      const message = toErrorMessage(error);
      setErrorMessage(message);
      setSelectedNotification(null);
      await loadPage(currentPage);
      setErrorMessage(message);
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
    reload,
    onSortChange: handleSortChange,
    pageCount,
    selectedNotification,
    sort,
    totalItems: total,
  };
}

function toErrorMessage(error: unknown) {
  return getNotificationManagementErrorMessage(
    error instanceof NotificationManagementError ? error.kind : "unexpected"
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    hour12: false,
  }).format(date);
}

function toListItem(notification: ManagedNotification): NotificationListItem {
  return {
    audience: notification.audienceName,
    canModify: canModifyNotification(notification),
    competition: notification.relatedEventName ?? "—",
    deliveredAt: formatDate(notification.scheduledAt),
    id: String(notification.id),
    schedule: formatDate(notification.scheduledAt),
    sender: notification.creatorName,
    status: notification.status,
    title: notification.title,
  };
}

function sortItems(
  items: readonly NotificationListItem[],
  sort: NotificationListSort | undefined
) {
  if (!sort) {
    return items;
  }

  const collator = new Intl.Collator("ja", {
    numeric: true,
    sensitivity: "base",
  });

  return [...items].sort((left, right) => {
    const result = collator.compare(left[sort.columnId], right[sort.columnId]);
    return sort.direction === "asc" ? result : -result;
  });
}
