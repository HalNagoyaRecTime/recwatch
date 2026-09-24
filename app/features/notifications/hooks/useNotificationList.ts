import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type {
  AdminNotificationListItem,
  AdminNotificationListQuery,
  AdminNotificationQueryApi,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import {
  filterNotificationList,
  sortNotificationList,
} from "~/features/notifications/hooks/notification-list-data";
import {
  reportNotificationActionError,
  reportNotificationBackgroundError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";
import {
  getNextNotificationListSort,
  isNotificationSortableColumnId,
  notificationListPageSize,
  type NotificationCreationMethodFilter,
  type NotificationListSort,
} from "~/features/notifications/model/notification-list";
import { getErrorMessage } from "~/lib/client-error";

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
  const [calendarNotifications, setCalendarNotifications] = useState<
    AdminNotificationListItem[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [creationMethod, setCreationMethod] =
    useState<NotificationCreationMethodFilter>("all");
  const [sort, setSort] = useState<NotificationListSort>();
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotificationListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [calendarErrorMessage, setCalendarErrorMessage] = useState<
    string | null
  >(null);
  const listRequestSequence = useRef(0);
  const calendarRequestSequence = useRef(0);

  const load = useCallback(
    async (background = false) => {
      const requestId = ++listRequestSequence.current;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await queryApi.list();
        if (requestId !== listRequestSequence.current) return;
        setNotifications(result.items);
      } catch (error) {
        if (requestId !== listRequestSequence.current) return;
        if (!background) setNotifications([]);
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
        if (requestId === listRequestSequence.current) setIsLoading(false);
      }
    },
    [queryApi, reportFeedback]
  );

  const loadCalendar = useCallback(
    async (query: AdminNotificationListQuery, background = false) => {
      const requestId = ++calendarRequestSequence.current;
      setIsCalendarLoading(true);
      setCalendarErrorMessage(null);

      try {
        const result = await queryApi.list(query);
        if (requestId !== calendarRequestSequence.current) return;
        setCalendarNotifications(result.items);
      } catch (error) {
        if (requestId !== calendarRequestSequence.current) return;
        if (!background) setCalendarNotifications([]);
        const message = getErrorMessage(error);
        setCalendarErrorMessage(message);
        if (background) {
          reportNotificationBackgroundError(reportFeedback, {
            title: "通知カレンダーを更新できませんでした",
            message,
            action: "notification.calendar.reload",
            endpoint: "/api/v1/admin/notifications",
            error,
          });
        }
      } finally {
        if (requestId === calendarRequestSequence.current) {
          setIsCalendarLoading(false);
        }
      }
    },
    [queryApi, reportFeedback]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(
    () => filterNotificationList(notifications, creationMethod),
    [creationMethod, notifications]
  );
  const allItems = useMemo(
    () => sortNotificationList(filteredItems, sort),
    [filteredItems, sort]
  );
  const pageCount = Math.max(
    1,
    Math.ceil(allItems.length / notificationListPageSize)
  );
  const items = allItems.slice(
    (currentPage - 1) * notificationListPageSize,
    currentPage * notificationListPageSize
  );
  const calendarItems = useMemo(
    () => filterNotificationList(calendarNotifications, creationMethod),
    [calendarNotifications, creationMethod]
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  function handleSortChange(columnId: string) {
    if (!isNotificationSortableColumnId(columnId)) return;
    setSort((current) => getNextNotificationListSort(current, columnId));
  }

  function handleCreationMethodChange(value: NotificationCreationMethodFilter) {
    setCreationMethod(value);
    setCurrentPage(1);
  }

  function handleDeleteRequest(notification: AdminNotificationListItem) {
    setSelectedNotification(notification);
  }

  async function handleDelete() {
    if (!selectedNotification || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await commandApi.delete(selectedNotification.notificationId);
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
        endpoint: `/api/v1/admin/notifications/${selectedNotification.notificationId}`,
        error,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    calendarErrorMessage,
    calendarItems,
    closeDeleteDialog: () => setSelectedNotification(null),
    confirmDelete: handleDelete,
    creationMethod,
    currentPage,
    errorMessage,
    isCalendarLoading,
    isDeleting,
    isLoading,
    items,
    loadCalendar,
    onCreationMethodChange: handleCreationMethodChange,
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
