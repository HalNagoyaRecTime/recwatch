import { useCallback, useEffect, useMemo, useState } from "react";

import { notificationListPageSize } from "~/features/notifications/model/notification-list-pagination";
import {
  getNextNotificationListSort,
  isNotificationSortableColumnId,
  type NotificationListSort,
} from "~/features/notifications/model/notification-list-sort";
import type { NotificationListItem } from "~/features/notifications/model/notification-list-item";
import { NotificationListView } from "~/features/notifications/components/NotificationListView";

import type { AdminNotificationManagementGateway } from "~/features/notifications/application/admin-notification-management-gateway";
import {
  NotificationManagementError,
  notificationManagementErrorMessages,
} from "~/features/notifications/application/notification-management-error";
import { DeleteNotificationDialog } from "~/features/notifications/components/DeleteNotificationDialog";
import type { ManagedNotification } from "~/features/notifications/model/managed-notification";

type NotificationListPageProps = {
  gateway: AdminNotificationManagementGateway;
};

function toErrorMessage(error: unknown) {
  return error instanceof NotificationManagementError
    ? notificationManagementErrorMessages[error.kind]
    : notificationManagementErrorMessages.unexpected;
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
    competition: notification.relatedEventName ?? "—",
    deliveredAt: formatDate(notification.scheduledAt),
    id: String(notification.id),
    schedule: formatDate(notification.scheduledAt),
    sender: notification.creatorName,
    status:
      notification.status === "failed"
        ? "failed"
        : notification.status === "sent"
          ? "delivered"
          : "pending",
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

  return [...items].sort((left, right) => {
    const result = left[sort.columnId].localeCompare(
      right[sort.columnId],
      "ja"
    );
    return sort.direction === "asc" ? result : -result;
  });
}

export function NotificationListPage({ gateway }: NotificationListPageProps) {
  const [notifications, setNotifications] = useState<ManagedNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<NotificationListSort>();
  const [selectedNotification, setSelectedNotification] =
    useState<ManagedNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPage = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await gateway.list({
          limit: notificationListPageSize,
          offset: (page - 1) * notificationListPageSize,
        });
        setNotifications(result.notifications);
        setTotal(result.total);
      } catch (error) {
        setNotifications([]);
        setTotal(0);
        setErrorMessage(toErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [gateway]
  );

  useEffect(() => {
    void loadPage(currentPage);
  }, [currentPage, loadPage]);

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
      await gateway.delete(selectedNotification.id);
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

  return (
    <>
      {errorMessage ? (
        <div
          aria-live="polite"
          className="text-tone-danger-text mx-auto mb-3 w-full text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : isLoading ? (
        <div aria-live="polite" className="sr-only">
          通知を読み込み中
        </div>
      ) : null}
      <NotificationListView
        currentPage={currentPage}
        items={items}
        onDelete={handleDeleteRequest}
        onPageChange={setCurrentPage}
        onSortChange={handleSortChange}
        pageCount={pageCount}
        sort={sort}
        totalItems={total}
      />
      {selectedNotification ? (
        <DeleteNotificationDialog
          notification={selectedNotification}
          isSubmitting={isDeleting}
          onClose={() => setSelectedNotification(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}
