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
  const [loadedApi, setLoadedApi] = useState<AdminNotificationQueryApi | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [calendarErrorMessage, setCalendarErrorMessage] = useState<
    string | null
  >(null);
  const requestSequence = useRef(0);
  const calendarRequestSequence = useRef(0);

  const load = useCallback(
    async (background = false) => {
      const requestId = ++requestSequence.current;
      try {
        const result = await Promise.resolve().then(() => queryApi.list());
        if (requestId !== requestSequence.current) return;
        setNotifications(result.items);
        setCurrentPage((page) =>
          Math.min(
            page,
            Math.max(
              1,
              Math.ceil(result.items.length / notificationListPageSize)
            )
          )
        );
        setErrorMessage(null);
        setLoadedApi(queryApi);
      } catch (error) {
        if (requestId !== requestSequence.current) return;
        if (!background) {
          setNotifications([]);
          setCurrentPage(1);
        }
        const message = getErrorMessage(error);
        setErrorMessage(message);
        setLoadedApi(queryApi);
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
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void load();
    });

    return () => {
      active = false;
      requestSequence.current += 1;
      calendarRequestSequence.current += 1;
    };
  }, [load]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
    return load(true);
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
  const validPage = Math.min(currentPage, pageCount);
  const items = allItems.slice(
    (validPage - 1) * notificationListPageSize,
    validPage * notificationListPageSize
  );
  const calendarItems = useMemo(
    () => filterNotificationList(calendarNotifications, creationMethod),
    [calendarNotifications, creationMethod]
  );

  function handlePageChange(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), pageCount));
  }

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
      await reload();
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
    currentPage: validPage,
    errorMessage: loadedApi === queryApi ? errorMessage : null,
    isCalendarLoading,
    isDeleting,
    isLoading: isLoading || loadedApi !== queryApi,
    items,
    loadCalendar,
    onCreationMethodChange: handleCreationMethodChange,
    onDeleteRequest: handleDeleteRequest,
    onPageChange: handlePageChange,
    onSortChange: handleSortChange,
    pageCount,
    reload,
    selectedNotification,
    sort,
    totalItems: allItems.length,
  };
}
