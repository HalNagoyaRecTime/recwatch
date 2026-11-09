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
// 1文字ごとに問い合わせないよう、検索語は入力が止まってから反映します。
const SearchDebounceMs = 300;

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
  const selectionMatchesSchedule = selection.scheduleId === scheduleId;
  const pendingSearch = selectionMatchesSchedule
    ? selection.filters.search
    : "";
  const [settledSearch, setSettledSearch] = useState(pendingSearch);
  useEffect(() => {
    if (pendingSearch === settledSearch) return;
    const timeoutId = window.setTimeout(
      () => setSettledSearch(pendingSearch),
      SearchDebounceMs
    );
    return () => window.clearTimeout(timeoutId);
  }, [pendingSearch, settledSearch]);
  const requestPage = selectionMatchesSchedule ? selection.page : 1;
  const requestSearch = selectionMatchesSchedule ? settledSearch.trim() : "";
  const requestStatus = selectionMatchesSchedule
    ? selection.filters.status
    : "all";
  const queryKey = JSON.stringify([requestPage, requestSearch, requestStatus]);
  const invalidateRequests = useCallback(() => {
    sequence.current++;
  }, []);
  const loadResults = useCallback(async () => {
    if (scheduleId === null) return;
    const issued = ++sequence.current;
    setLoadingId(scheduleId);
    setError(null);
    try {
      const result = await api.getResults(scheduleId, {
        page: requestPage,
        limit: ResultsPageSize,
        ...(requestSearch ? { search: requestSearch } : {}),
        ...(requestStatus !== "all" ? { status: requestStatus } : {}),
        includeRegisteredAt: "1",
      });
      if (issued !== sequence.current) return;
      setSnapshot({
        scheduleId,
        queryKey,
        items: result.recipients.items,
        pagination: result.recipients.pagination,
      });
    } catch {
      if (issued === sequence.current)
        setError({ scheduleId, message: "配信結果を読み込めませんでした。" });
    } finally {
      if (issued === sequence.current) setLoadingId(null);
    }
  }, [api, scheduleId, requestPage, requestSearch, requestStatus, queryKey]);
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
  const snapshotMatchesSchedule = snapshot?.scheduleId === scheduleId;
  const data = snapshotMatchesSchedule ? snapshot.items : null;
  const filters =
    selection.scheduleId === scheduleId
      ? selection.filters
      : defaultResultFilters;
  const pagination = snapshotMatchesSchedule
    ? snapshot.pagination
    : { page: 1, limit: ResultsPageSize, totalCount: 0, totalPages: 1 };
  const pageCount = Math.max(1, pagination.totalPages);
  const page = Math.min(
    selection.scheduleId === scheduleId ? selection.page : 1,
    pageCount
  );
  const isLoading =
    active &&
    scheduleId !== null &&
    (loadingId === scheduleId || (!data && error?.scheduleId !== scheduleId));
  return {
    data,
    items: data ?? [],
    total: pagination.totalCount,
    page,
    pageCount,
    filters,
    isLoading,
    isRefreshing: data !== null && isLoading,
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
