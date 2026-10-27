import { toNotificationMonthRange } from "~/features/notifications/hooks/notification-calendar-range";
import { useCurrentMinute } from "~/hooks/useCurrentMinute";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AdminNotificationCommandApi } from "~/features/notifications/api/contracts/admin-notification-command-api";
import type {
  AdminNotificationListItem,
  AdminNotificationListQuery,
  AdminNotificationQueryApi,
} from "~/features/notifications/api/contracts/admin-notification-query-api";
import {
  canDeleteNotification,
  filterNotificationList,
  matchesNotificationSchedule,
} from "~/features/notifications/model/notification-list-data";
import {
  reportNotificationActionError,
  reportNotificationBackgroundError,
  type NotificationFeedbackReporter,
} from "~/features/notifications/hooks/notification-feedback";
import {
  defaultNotificationListFilters,
  type NotificationListFilters,
  getNextNotificationListSort,
  isNotificationSortableColumnId,
  notificationListPageSize,
  type NotificationCreationMethodFilter,
  type NotificationListSort,
} from "~/features/notifications/model/notification-list";
import { getErrorMessage } from "~/lib/client-error";

type UseNotificationListOptions = {
  calendarMonth?: Date;
  commandApi: AdminNotificationCommandApi;
  queryApi: AdminNotificationQueryApi;
  reportFeedback?: NotificationFeedbackReporter;
};

export function useNotificationList({
  calendarMonth,
  commandApi,
  queryApi,
  reportFeedback,
}: UseNotificationListOptions) {
  const currentMinute = useCurrentMinute();
  const now = currentMinute?.getTime() ?? 0;
  const [items, setItems] = useState<AdminNotificationListItem[]>([]);
  const [calendarNotifications, setCalendarNotifications] = useState<
    AdminNotificationListItem[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = notificationListPageSize;
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState(defaultNotificationListFilters);
  function onFiltersChange(value: NotificationListFilters) {
    setFilters(value);
    setCurrentPage(1);
  }
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
  const deleting = useRef(false);
  const calendarQuery = useRef<AdminNotificationListQuery | null>(null);
  const pendingReads = useRef(new Set<Promise<unknown>>());
  const read = useCallback(
    (query?: AdminNotificationListQuery) => {
      const request = Promise.resolve().then(() => queryApi.list(query));
      const tracked = request.finally(() =>
        pendingReads.current.delete(tracked)
      );
      pendingReads.current.add(tracked);
      return tracked;
    },
    [queryApi]
  );
  const requestSequence = useRef(0);
  const calendarRequestSequence = useRef(0);

  const load = useCallback(
    async (page = 1, background = false) => {
      const requestId = ++requestSequence.current;
      try {
        const result = await read({
          page,
          limit: pageSize,
        });
        if (requestId !== requestSequence.current) return;
        setItems(result.items);
        setTotalItems(result.pagination.totalCount);
        setCurrentPage(result.pagination.page);
        setErrorMessage(null);
        setLoadedApi(queryApi);
      } catch (error) {
        if (requestId !== requestSequence.current) return;
        if (!background) {
          setItems([]);
          setTotalItems(0);
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
    [pageSize, queryApi, read, reportFeedback]
  );

  const loadCalendar = useCallback(
    async (query: AdminNotificationListQuery, background = false) => {
      calendarQuery.current = query;
      const requestId = ++calendarRequestSequence.current;
      setIsCalendarLoading(true);
      setCalendarErrorMessage(null);

      try {
        const result = await read(query);
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
    [read, reportFeedback]
  );

  const activeCalendarRange = useMemo(
    () => (calendarMonth ? toNotificationMonthRange(calendarMonth) : undefined),
    [calendarMonth]
  );
  useEffect(() => {
    if (!activeCalendarRange) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void loadCalendar(activeCalendarRange);
    });
    return () => {
      active = false;
    };
  }, [activeCalendarRange, loadCalendar]);

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
    return load(currentPage, true);
  }, [load, currentPage]);

  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(currentPage, pageCount);
  const calendarItems = useMemo(() => {
    const calendarFilters = { ...filters, dateMode: "all" as const };
    return filterNotificationList(
      calendarNotifications,
      creationMethod,
      calendarFilters,
      now
    ).map((item) => ({
      ...item,
      schedules: item.schedules.filter((schedule) =>
        matchesNotificationSchedule(schedule, calendarFilters, now)
      ),
    }));
  }, [calendarNotifications, creationMethod, filters, now]);

  function handlePageChange(page: number) {
    const newPage = Math.min(Math.max(page, 1), pageCount);
    setCurrentPage(newPage);
    void load(newPage, true);
  }

  function handleSortChange(columnId: string) {
    if (!isNotificationSortableColumnId(columnId)) return;
    setSort((current) => getNextNotificationListSort(current, columnId));
    setCurrentPage(1);
    void load(1, true);
  }

  function handleCreationMethodChange(value: NotificationCreationMethodFilter) {
    setCreationMethod(value);
    setCurrentPage(1);
    void load(1, true);
  }

  function handleDeleteRequest(notification: AdminNotificationListItem) {
    if (!deleting.current && canDeleteNotification(notification))
      setSelectedNotification(notification);
  }

  async function handleDelete() {
    if (
      !selectedNotification ||
      deleting.current ||
      !canDeleteNotification(selectedNotification)
    )
      return;
    deleting.current = true;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await commandApi.delete(selectedNotification.notificationId);
      setSelectedNotification(null);
      // 共有中の古いGETが完了してから、削除後の新しいGETを取得します。
      await Promise.allSettled([...pendingReads.current]);
      await reload();
      if (calendarQuery.current)
        await loadCalendar(calendarQuery.current, true);
      reportFeedback?.({
        kind: "action-success",
        title: "通知を削除しました",
        message: "未送信の通知を削除しました。",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      // 共有中の古いGETが完了してから、削除後の新しいGETを取得します。
      await Promise.allSettled([...pendingReads.current]);
      await reload();
      if (calendarQuery.current)
        await loadCalendar(calendarQuery.current, true);
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
      deleting.current = false;
      setIsDeleting(false);
    }
  }

  return {
    filters,
    onFiltersChange,
    pageSize,
    calendarErrorMessage,
    calendarItems,
    closeDeleteDialog: () => {
      if (!deleting.current) setSelectedNotification(null);
    },
    confirmDelete: handleDelete,
    creationMethod,
    currentPage: validPage,
    errorMessage: loadedApi === queryApi ? errorMessage : null,
    isCalendarLoading,
    isDeleting,
    isLoading: isLoading || loadedApi !== queryApi,
    items,
    loadCalendar,
    reloadCalendar: () =>
      activeCalendarRange
        ? loadCalendar(activeCalendarRange, true)
        : Promise.resolve(),
    now,
    onCreationMethodChange: handleCreationMethodChange,
    onDeleteRequest: handleDeleteRequest,
    onPageChange: handlePageChange,
    onSortChange: handleSortChange,
    pageCount,
    reload,
    selectedNotification,
    sort,
    totalItems,
  };
}
