import { useCallback, useEffect, useRef, useState } from "react";
import type {
  NotificationScheduleQueryApi,
  NotificationScheduleResults,
} from "~/features/notifications/api/contracts/notification-schedule-query-api";
import {
  defaultResultFilters,
  type ResultFilters,
} from "~/features/notifications/model/notification-results";

const ResultsPageSize = 50;

type Options = {
  api: NotificationScheduleQueryApi;
  scheduleId: number | null;
  active: boolean;
  refreshKey: number;
};
type Snapshot = {
  scheduleId: number;
  queryKey: string;
  items: NotificationScheduleResults["recipients"]["items"];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};
export function useNotificationResults({
  api,
  scheduleId,
  active,
  refreshKey,
}: Options) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<{
    scheduleId: number;
    message: string;
  } | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [selection, setSelection] = useState<{
    scheduleId: number | null;
    filters: ResultFilters;
    page: number;
  }>({ scheduleId: null, filters: defaultResultFilters, page: 1 });
  const sequence = useRef(0);
  const queryKey =
    selection.scheduleId === scheduleId
      ? JSON.stringify([
          selection.page,
          selection.filters.search,
          selection.filters.status,
        ])
      : JSON.stringify([1, "", "all"]);
  const invalidateRequests = useCallback(() => {
    sequence.current++;
  }, []);
  const loadResults = useCallback(async () => {
    if (scheduleId === null) return;
    const request = ++sequence.current;
    setLoadingId(scheduleId);
    setError(null);
    try {
      const page = selection.scheduleId === scheduleId ? selection.page : 1;
      const result = await api.getResults(scheduleId, {
        page,
        limit: ResultsPageSize,
        ...(selection.scheduleId === scheduleId &&
        selection.filters.search.trim()
          ? { search: selection.filters.search.trim() }
          : {}),
        ...(selection.scheduleId === scheduleId &&
        selection.filters.status !== "all"
          ? { status: selection.filters.status }
          : {}),
        includeRegisteredAt: "1",
      });
      if (request !== sequence.current) return;
      setSnapshot({
        scheduleId,
        queryKey,
        items: result.recipients.items,
        pagination: result.recipients.pagination,
      });
    } catch {
      if (request === sequence.current)
        setError({ scheduleId, message: "配信結果を読み込めませんでした。" });
    } finally {
      if (request === sequence.current) setLoadingId(null);
    }
  }, [api, scheduleId, selection, queryKey]);
  useEffect(() => {
    if (!active || scheduleId === null) return;
    let mounted = true;
    queueMicrotask(() => {
      if (mounted) void loadResults();
    });
    return () => {
      mounted = false;
      invalidateRequests();
    };
  }, [active, loadResults, refreshKey, scheduleId, invalidateRequests]);
  const data =
    snapshot?.scheduleId === scheduleId && snapshot.queryKey === queryKey
      ? snapshot.items
      : null;
  const filters =
    selection.scheduleId === scheduleId
      ? selection.filters
      : defaultResultFilters;
  const pagination =
    snapshot?.scheduleId === scheduleId && snapshot.queryKey === queryKey
      ? snapshot.pagination
      : { page: 1, limit: ResultsPageSize, totalCount: 0, totalPages: 1 };
  const pageCount = Math.max(1, pagination.totalPages);
  const page = Math.min(
    selection.scheduleId === scheduleId ? selection.page : 1,
    pageCount
  );
  return {
    data,
    items: data ?? [],
    total: pagination.totalCount,
    page,
    pageCount,
    filters,
    isLoading:
      active &&
      scheduleId !== null &&
      (loadingId === scheduleId || (!data && error?.scheduleId !== scheduleId)),
    errorMessage: error?.scheduleId === scheduleId ? error.message : null,
    loadResults,
    resetFilters: () =>
      setSelection({
        scheduleId: null,
        filters: defaultResultFilters,
        page: 1,
      }),
    onFiltersChange: (filters: ResultFilters) =>
      setSelection({ scheduleId, filters, page: 1 }),
    onPageChange: (page: number) =>
      setSelection({
        scheduleId,
        filters,
        page: Math.min(Math.max(1, page), pageCount),
      }),
  };
}
